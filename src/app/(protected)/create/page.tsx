"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { create } from 'domain'
import { toast } from 'sonner'
import { api } from '@/trpc/react'

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const Createpage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()

   function onSubmit(data: FormInput) {
        createProject.mutate({
            githubUrl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        }, {
            onSuccess: ()=>{
                toast.success('Project created successfully')
                reset()
            },
            onError: ()=>{
                toast.error('Failed to create project')
            }
        })
        return true
    }
    return (
        <div className='flex items-center gap-12 h-full justify-center'>
            <Image 
                src="/images/undraw_advanced_customization_re_wo6h.svg" 
                alt="Custom Image" 
                width={500} 
                height={500} 
                className='h-56 w-auto'
            />
            <div>
                <div>
                    <h1 className='font-semibold text-2xl'>Link your Github Repository</h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter the URL of your Github repository to get started
                    </p>
                </div>
                <div className="h-4"></div>
                <div>
                    <form className='' onSubmit={handleSubmit(onSubmit)}>
                        <Input {...register('projectName', { required: true })} placeholder='Project Name' />
                        <div className="h-2"></div>
                        <Input {...register('repoUrl', { required: true })} placeholder='GitHub Url' type='url' />
                        <div className="h-2"></div> 
                        <Input {...register('githubToken')} placeholder='Github Token' />
                        <div className="h-4"></div>
                        <Button type='submit' disabled={createProject.isPending}>Create Project</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Createpage