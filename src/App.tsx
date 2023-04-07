import { useState } from 'react';

import './styles/global.css';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from './lib/supabase';

const createUserSchema = z.object({
    avatar: z.instanceof(FileList)
        .transform(list => list.item(0)!)
        .refine(file => file?.size < 1000000, 'File size must be less than 1MB'),
    name: z.string()
        .nonempty('Name is required')
        .transform(name => {
            return name.trim().split(' ').map(word => {
                return word.charAt(0).toLocaleUpperCase().concat(word.slice(1));
            }).join(' ');
        }),
    email: z.string()
        .nonempty('Email is required')
        .email('Email must be a valid email address')
        .toLowerCase()
        .refine(email => {
            return email.endsWith('@gov.pt');
        }, 'Email must be a .gov.pt email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
        .min(6, 'Confirm Password must be at least 6 characters'),
    skills: z.array(z.object({
        name: z.string().nonempty('Skill name is required'),
        level: z.coerce.number().min(1, 'Skill level must be at least 1').max(5, 'Skill level must be at most 5')
    })).min(2, 'You must have at least 2 skills')
})
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "The passwords did not match",
                path: ["confirmPassword"],
            });
        }

        return false;
    });

type CreateUserData = z.infer<typeof createUserSchema>;

function App() {

    const [output, setOutput] = useState('');
    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CreateUserData>({
        resolver: zodResolver(createUserSchema)
    });

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: 'skills'
    })

    function addNewSkill() {
        append({
            name: '',
            level: 1
        });
    }

    function createUser(data: CreateUserData) {
        supabase.storage.from('form').upload(data.avatar.name, data.avatar);
        setOutput(JSON.stringify(data, null, 2));
    }

    return (
        <main className="h-screen bg-zinc-950 flex items-center justify-center flex-col gap-10">
            <form
                className="flex flex-col gap-4 w-full max-w-xs"
                onSubmit={handleSubmit(createUser)}
            >
                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Avatar">Avatar</label>
                    <input
                        type="file"
                        accept="image/*"
                        {...register("avatar")}
                    />
                    {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}
                </div>

                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Name">Name</label>
                    <input
                        type="text"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("name")}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Email">Email</label>
                    <input
                        type="email"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("email")}
                    />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Password">Password</label>
                    <input
                        type="password"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("password")}
                    />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>

                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="ConfirmPassword">ConfirmPassword</label>
                    <input
                        type="password"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-white">
                        <label htmlFor="Skills">Skills</label>
                        <button
                            type="button"
                            className="font-semibold h-10 text-white hover:text-emerald-600 text-sm"
                            onClick={addNewSkill}
                        >
                            Add
                        </button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <div className="flex  gap-2 text-white">
                                <div className="flex flex-1 flex-col gap-1">
                                    <input
                                        type="text"
                                        className=" border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                                        {...register(`skills.${index}.name` as const)}
                                    />

                                    {errors.skills?.[index]?.name && <p className="text-red-500">{errors.skills[index]?.name?.message}</p>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <input
                                        type="number"
                                        className="w-16 border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                                        {...register(`skills.${index}.level` as const)}
                                    />
                                    {errors.skills?.[index]?.level && <p className="text-red-500">{errors.skills[index]?.level?.message}</p>}
                                </div>
                                <button
                                    type="button"
                                    className="bg-red-500 rounded font-semibold h-10 w-10 text-white hover:bg-red-600"
                                    onClick={() => remove(index)}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}

                    {errors.skills && <p className="text-red-500">{errors.skills.message}</p>}
                </div>

                <button type="submit" className="bg-emerald-500 rounded font-semibold h-10 text-white hover:bg-emerald-600">Login</button>
            </form>

            <pre className="text-white">{output}</pre>
        </main>
    )
}

export default App
