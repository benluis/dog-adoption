'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FetchDog from '@/components/FetchDog';

interface BreedList {
    [breed: string]: string[];
}

const Browse = () => {
    const router = useRouter();
    const [breedData, setBreedData] = useState<BreedList>({});
    const [selectedBreed, setSelectedBreed] = useState<string>('');

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
    }, []);

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
        <main className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl mb-2">browse dogs</h1>

            <section className="mb-4">
                <label className="block mb-1">choose a breed:</label>
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
            </section>

            <FetchDog limit={24} />
        </main>
    );
};

export default Browse;