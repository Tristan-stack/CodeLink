// FILE: github.ts

import { db } from '@/server/db';
import { Prisma } from '@prisma/client';
import { Octokit } from 'octokit';
import axios from 'axios';
import { headers } from 'next/headers';
import { geminiCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN!,
});

type Response = {
    commitMessage: string;
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

function cleanGithubUrl(githubUrl: string): string {
    if (githubUrl.endsWith('.git')) {
        return githubUrl.slice(0, -4);
    }
    return githubUrl;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const cleanedUrl = cleanGithubUrl(githubUrl);
    const parts = cleanedUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    console.log(`Owner: ${owner}, Repo: ${repo}`);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
    });

    const sortedCommits = data.sort((a: any, b: any) =>
        new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
    ) as any[];

    return sortedCommits.slice(0, 2).map((commit: any) => ({
        commitMessage: commit.commit.message ?? 'No message provided',
        commitHash: commit.sha as string,
        commitAuthorName: commit.commit.author.name ?? 'No author provided',
        commitAuthorAvatar: commit?.author?.avatar_url ?? 'No avatar provided',
        commitDate: commit.commit?.author.date ?? 'No date provided',
    }));
};

export const pullCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

    if (!githubUrl) {
        console.error('GitHub URL is undefined.');
        return;
    }

    const cleanedUrl = cleanGithubUrl(githubUrl);
    const commitHashes = await getCommitHashes(cleanedUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(
        unprocessedCommits.map((commit) => summariseCommit(cleanedUrl, commit.commitHash))
    );

    const summaries = summaryResponses.map((response, index) => {
        if (response.status === 'fulfilled') {
            return response.value as string;
        }
        console.warn(
            `Summary generation failed for commit ${unprocessedCommits[index]?.commitHash ?? 'Unknown'
            }:`,
            response.reason
        );
        return 'No summary provided';
    });

    await db.commit.createMany({
        data: summaries
            .map((summary, index) => {
                const commit = unprocessedCommits[index];
                if (!commit) {
                    console.warn(`Commit at index ${index} is undefined. Skipping...`);
                    return null;
                }
                return {
                    projectId,
                    commitHash: commit.commitHash,
                    commitMessage: commit.commitMessage,
                    commitAuthorName: commit.commitAuthorName,
                    commitAuthorAvatar: commit.commitAuthorAvatar,
                    commitDate: new Date(commit.commitDate),
                    summary: summary,
                };
            })
            .filter((commitData) => commitData !== null) as Prisma.CommitCreateManyInput[],
    });

    return unprocessedCommits;
};

async function summariseCommit(githubUrl: string, commitHash: string): Promise<string> {
    const cleanedUrl = cleanGithubUrl(githubUrl);
    try {
        const { data } = await axios.get(`${cleanedUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
            },
        });
        const summary = await geminiCommit(data);
        return summary || 'No summary provided';
    } catch (error) {
        console.error(`Error summarizing commit ${commitHash}:`, error);
        return 'No summary provided';
    }
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    });
    return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId
        },
        select: {
            commitHash: true
        }
    });

    const processedHashSet = new Set(processedCommits.map(commit => commit.commitHash));

    const unprocessedCommits = commitHashes.filter(commit => !processedHashSet.has(commit.commitHash));
    return unprocessedCommits;
}

// Example usage:
// await pullCommits('cm4dargvx0000yjeff6gg140i').then(console.log).catch(console.error);