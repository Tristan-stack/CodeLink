import { db } from '@/server/db';
import { Prisma } from '@prisma/client';
import { Octokit } from 'octokit';
import axios from 'axios';
import { headers } from 'next/headers';
import { geminiCommit } from './gemini';


export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const githubUrl = 'https://github.com/docker/genai-stack';

type Response = {
    commitMessage: string;
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    // https://github.com/Tristan-stack/CodeLink
    const parts = githubUrl.split('/');
    const owner = parts[parts.length - 2];
    let repo = parts[parts.length - 1];

    // Supprimer l'extension .git si elle existe
    if (repo?.endsWith('.git')) {
        repo = repo.slice(0, -4);
    }

    console.log(`Owner: ${owner}, Repo: ${repo}`);
    if (!owner || !repo) {
        throw new Error('Invalid github url');
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    });
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[];
    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitMessage: commit.commit.message ?? 'No message provided',
        commitHash: commit.sha as string,
        commitAuthorName: commit.commit.author.name ?? 'No author provided',
        commitAuthorAvatar: commit?.author?.avatar_url ?? 'No avatar provided',
        commitDate: commit.commit?.author.date ?? 'No date provided'

    }));
}

export const pullCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl ?? '');
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
        return summariseCommit(githubUrl ?? '', commit.commitHash);
    }))
    const summaries = summaryResponses.map((response) => {
        if (response.status === 'fulfilled') {
            return response.value as string;  
        }
        return 'No summary provided';
    })

    const commits =await db.commit.createMany({
        data: summaries.map((commit, index) => {
            console.log(`procesing commit ${index}`);
            return {
                projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary: commit
            }
        })
    })

    return commits;
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    // recupérer le diff de chaque commit et le donner a gemini
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }

    });
    return await geminiCommit(data) || 'No summary provided';
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    })
    return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId
        }
    });
    const unprocessedCommits = commitHashes.filter(commit => !processedCommits.some(processedCommit => processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits;
}

// await pullCommits('cm4dargvx0000yjeff6gg140i').then(console.log).catch(console.error);