import { useState } from 'react';

import './styles/global.css';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from './lib/supabase';
import { Form } from './components/Form';

const createUserSchema = z.object({
    avatar: z.instanceof(FileList)
        .transform(list => list.item(0)!)
        .refine(file => file?.size < 5 * 1024 * 1024, 'File size must be less than 5MB'),
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
    const createUserForm = useForm<CreateUserData>({
        resolver: zodResolver(createUserSchema)
    });

    const {
        control,
        handleSubmit,
    } = createUserForm;

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

    async function createUser(data: CreateUserData) {
        await supabase().storage.from('form').upload(data.avatar.name, data.avatar);
        setOutput(JSON.stringify(data, null, 2));
    }

    return (
        <main className="h-screen bg-zinc-950 flex items-center justify-center flex-col gap-10">
            <FormProvider {...createUserForm}>
                <form
                    {...{ control }}
                    className="flex flex-col gap-4 w-full max-w-xs"
                    onSubmit={handleSubmit(createUser)}
                >
                    <Form.Field>
                        <Form.Label name="Avatar" />
                        <Form.Input
                            type="file"
                            accept="image/*"
                            name="avatar"
                        />
                        <Form.ErrorMessage field="avatar" />
                    </Form.Field>

                    <Form.Field>
                        <Form.Label name="Name" />
                        <Form.Input
                            type="text"
                            name="name"
                        />
                        <Form.ErrorMessage field="name" />
                    </Form.Field>

                    <Form.Field>
                        <Form.Label name="Email" />
                        <Form.Input
                            type="email"
                            name="email"
                        />
                        <Form.ErrorMessage field="email" />
                    </Form.Field>

                    <Form.Field>
                        <Form.Label name="Password" />
                        <Form.Input
                            type="password"
                            name="password"
                        />
                        <Form.ErrorMessage field="password" />
                    </Form.Field>

                    <Form.Field>
                        <Form.Label name="ConfirmPassword" />
                        <Form.Input
                            type="password"
                            name="confirmPassword"
                        />
                        <Form.ErrorMessage field="confirmPassword" />
                    </Form.Field>

                    <div className="flex flex-col gap-1">
                        <Form.Field className="flex items-center justify-between text-white">
                            <Form.Label name="Skills" />
                            <button
                                type="button"
                                className="font-semibold h-10 text-white hover:text-emerald-600 text-sm"
                                onClick={addNewSkill}
                            >
                                Add
                            </button>
                        </Form.Field>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <div className="flex  gap-2 text-white">
                                    <Form.Field className="flex flex-1 flex-col gap-1">
                                        <Form.Input
                                            type="text"
                                            name={`skills.${index}.name`}
                                        />

                                        <Form.ErrorMessage field={`skills.${index}.name`} />
                                    </Form.Field>
                                    <Form.Field className="flex flex-col gap-1">
                                        <Form.Input
                                            type="number"
                                            name={`skills.${index}.level`}
                                            className="w-16 border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                                        />
                                        <Form.ErrorMessage field={`skills.${index}.level`} />
                                    </Form.Field>
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

                        <Form.ErrorMessage field="skills" />
                    </div>

                    <button type="submit" className="bg-emerald-500 rounded font-semibold h-10 text-white hover:bg-emerald-600">Login</button>
                </form>
            </FormProvider>

            <pre className="text-white">{output}</pre>
        </main>
    )
}

export default App
