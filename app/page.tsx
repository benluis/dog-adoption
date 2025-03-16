'use client';

import FetchDog from '@/components/FetchDog';

const Home = () => {
    return (
        <main className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl mb-4 text-center">adopt a dog!</h1>
            <FetchDog limit={48} />
        </main>
    );
};

export default Home;