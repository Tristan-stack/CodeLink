import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const projectRouter = createTRPCRouter(
    {
        createProject: protectedProcedure.input(
            z.object({
                name: z.string(),
                githubUrl: z.string(),
                githubToken: z.string().optional(),
            })
        ).mutation(async ({ ctx, input }) => {
            console.log('User ID:', ctx.user.userId);
            const project = await ctx.db.project.create({
                data: {
                    githubUrl: input.githubUrl,
                    name: input.name,
                    userToProjects: {
                        create: {
                            userId: ctx.user.userId!,
                        }
                    }
                }
            })
            return project
        })
    }
)