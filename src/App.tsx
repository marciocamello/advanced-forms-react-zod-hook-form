import { useState } from 'react';
import './styles/global.css'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

function App() {

    const [output, setOutput] = useState('');
    const { register, handleSubmit } = useForm();

    function createUser(data: any) {
        setOutput(JSON.stringify(data, null, 2));
    }

    return (
        <main className="h-screen bg-zinc-950 flex items-center justify-center flex-col gap-10">
            <form
                className="flex flex-col gap-4 w-full max-w-xs"
                onSubmit={handleSubmit(createUser)}
            >
                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Email">Email</label>
                    <input
                        type="email"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("email")}
                    />
                </div>

                <div className="flex flex-col gap-1 text-white">
                    <label htmlFor="Password">Password</label>
                    <input
                        type="password"
                        className="border border-zinc-800 px-3 bg-zinc-800 text-white shadow-sm rounded h-10"
                        {...register("password")}
                    />
                </div>

                <button type="submit" className="bg-emerald-500 rounded font-semibold h-10 text-white hover:bg-emerald-600">Login</button>
            </form>

            <pre className="text-white">{output}</pre>
        </main>
    )
}

export default App
