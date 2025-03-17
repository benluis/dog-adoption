// app/browse/[breed]/[subbreed]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FetchDog from '@/components/FetchDog';

export const dynamic = 'force-dynamic';

interface BreedList {
    [breed: string]: string[];
}

const SubBreedPage = () => {
    const params = useParams();
    const breed = params.breed as string;
    const subbreed = params.subbreed as string;

    const router = useRouter();
    const [breedData, setBreedData] = useState<BreedList>({});
    const [selectedBreed, setSelectedBreed] = useState<string>(`${breed}/${subbreed}`);

    useEffect(() => {
        async function fetchBreeds() {
            try {
                const data = await (await fetch('https://dog.ceo/api/breeds/list/all')).json();
                setBreedData(data.message);
            } catch (error) {
                console.error('Failed to fetch breeds:', error);
            }
        }

        fetchBreeds();
    }, [breed, subbreed]);

    const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const breed = e.target.value;
        setSelectedBreed(breed);

        if (breed.includes('/')) {
            const [mainBreed, subBreed] = breed.split('/');
            router.push(`/browse/${mainBreed}/${subBreed}`);
        } else if (breed) {
            router.push(`/browse/${breed}`);
        } else {
            router.push('/browse');
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">{breed} {subbreed} dogs</h1>

            <div className="mb-8">
                <h2 className="block mb-2 text-lg font-medium">
                    choose a breed:
                </h2>
                <select
                    className="w-full p-1"
                    onChange={handleBreedChange}
                    value={selectedBreed}
                >
                    <option value="">all breeds</option>
                    {Object.entries(breedData).map(([breed, subBreeds]) => {
                        if (subBreeds.length == 0) {
                            return (
                                <option key={breed} value={breed}>
                                    {breed}
                                </option>
                            );
                        }

                        return (
                            <optgroup key={breed} label={breed}>
                                {subBreeds.map(subBreed => (
                                    <option key={`${breed}/${subBreed}`} value={`${breed}/${subBreed}`}>
                                        {breed} {subBreed}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
            </div>

            <FetchDog breed={breed} subbreed={subbreed} limit={24} />
        </main>
    );
};

export default SubBreedPage;