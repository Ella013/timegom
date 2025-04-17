import Navbar from '@/components/Navbar';
import Clock from '@/components/Clock';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-center flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-8 text-center">현재 시간</h1>
        <Clock />
      </div>
    </main>
  );
} 