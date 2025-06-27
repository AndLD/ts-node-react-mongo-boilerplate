import { ConfigProvider } from 'antd'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1677ff' //'#168037'
                }
            }}
        >
            {children}
        </ConfigProvider>
    )
}
