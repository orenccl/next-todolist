import AuthContainer from '@/components/AuthContainer';

export default function Home() {
    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-4'>Next.js + Prisma 登入系統</h1>
                    <p className='text-lg text-gray-600'>簡易的用戶認證系統，前端不直接操作資料庫</p>
                </div>

                <AuthContainer />
            </div>
        </div>
    );
}
