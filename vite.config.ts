import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default ({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const processEnvValues = {
        "process.env": Object.entries(env).reduce((prev, [key, val]) => {
            return {
                ...prev,
                [key]: val,
            };
        }, {}),
    };
    return defineConfig({
        plugins: [react()],
        define: processEnvValues,
    })
}
