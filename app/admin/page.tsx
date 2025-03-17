'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

interface Dog {
    breed: string;
    image_url: string;
    status: string;
}

export default function Admin() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [newDog, setNewDog] = useState<Dog>({ breed: '', image_url: '', status: 'available' });
    const supabase = createClient();

    const fetchDogs = async () => {
        const { data } = await supabase
            .from('dogs')
            .select('*')
            .eq('status', 'available');

        setDogs(data || []);
    };

    useEffect(() => {
        fetchDogs();
    }, []);

    const addDog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newDog.breed == '') {
            return;
        }

        await supabase.from('dogs').insert([newDog]);
        setNewDog({ breed: '', image_url: '', status: 'available' });
        fetchDogs();
    };

    const deleteDog = async (image_url: string) => {
        await supabase.from('dogs').delete().eq('image_url', image_url);
        fetchDogs();
    };

    const markAdopted = async (image_url: string) => {
        const { error } = await supabase
            .from('dogs')
            .update({ status: 'adopted' })
            .eq('image_url', image_url);

        if (error == null) {
            fetchDogs();
        }
    };

    return (
        <main className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl mb-2">admin dashboard</h1>

            <section className="mb-4 p-4">
                <h2 className="mb-2">add new dog</h2>
                <form onSubmit={addDog} className="space-y-4">
                    <div>
                        <label className="block mb-1">breed</label>
                        <input
                            type="text"
                            value={newDog.breed}
                            onChange={(e) => setNewDog({...newDog, breed: e.target.value})}
                            className="w-full p-1"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">image url</label>
                        <input
                            type="text"
                            value={newDog.image_url}
                            onChange={(e) => setNewDog({...newDog, image_url: e.target.value})}
                            className="w-full p-1"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-2 py-1 w-full"
                    >
                        add dog
                    </button>
                </form>
            </section>

            <h2 className="mb-2">available dogs</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {dogs.map((dog) => (
                    <div key={dog.image_url} className="p-2">
                        {dog.image_url && (
                            <img
                                src={dog.image_url}
                                className="w-full h-48 object-cover"
                                alt={dog.breed}
                            />
                        )}
                        <p>{dog.breed}</p>
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => markAdopted(dog.image_url)}
                                className="bg-blue-600 text-white px-2 py-1 w-full"
                            >
                                adopt
                            </button>
                            <button
                                onClick={() => deleteDog(dog.image_url)}
                                className="bg-gray-500 px-2 py-1 w-full"
                            >
                                delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}