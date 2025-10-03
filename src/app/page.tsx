import AuthContainer from '@/components/AuthContainer';
import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            待辦事項管理
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            讓生活更有條理，讓工作更有效率
          </p>
        </div>

        <AuthContainer />
        <TodoList />
      </div>
    </div>
  );
}
