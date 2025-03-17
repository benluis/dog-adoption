'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface DogStatusMap {
    [imageUrl: string]: string;
}

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    return createBrowserClient(supabaseUrl, supabaseKey);
}

const FetchDog = ({ breed = '', subbreed = '', limit = 12 }) => {
    const [dogImages, setDogImages] = useState<string[]>([]);
    const [dogStatuses, setDogStatuses] = useState<DogStatusMap>({});
    const [supabase, setSupabase] = useState(null);

    let mainBreed = breed;
    let subBreed = subbreed;

    if (breed.includes('/')) {
        const parts = breed.split('/');
        mainBreed = parts[0];
        subBreed = parts[1];
    }

    useEffect(() => {
        setSupabase(createClient());
    }, []);

    useEffect(() => {
        async function fetchDogImages() {
            let url = '';

            if (!mainBreed) {
                url = `https://dog.ceo/api/breeds/image/random/${limit}`;
            } else if (subBreed) {
                url = `https://dog.ceo/api/breed/${mainBreed}/${subBreed}/images/random/${limit}`;
            } else {
                url = `https://dog.ceo/api/breed/${mainBreed}/images/random/${limit}`;
            }

            try {
                const data = await (await fetch(url)).json();

                if (Array.isArray(data.message)) {
                    setDogImages(data.message);
                    if (supabase) {
                        checkDogStatuses(data.message);
                    }
                } else if (typeof data.message == 'string') {
                    setDogImages([data.message]);
                    if (supabase) {
                        checkDogStatuses([data.message]);
                    }
                } else {
                    setDogImages([]);
                }

            } catch (error) {
                console.error('Failed to fetch dog images:', error);
                setDogImages([]);
            }
        }

        fetchDogImages();
    }, [mainBreed, subBreed, limit, supabase]);

    async function checkDogStatuses(images: string[]) {
        if (!images || images.length == 0 || !supabase) {
            return;
        }

        const { data } = await supabase
            .from('dogs')
            .select('image_url, status')
            .in('image_url', images);

        const statusMap: DogStatusMap = {};

        if (data) {
            for (const dog of data) {
                statusMap[dog.image_url] = dog.status;
            }
        }

        setDogStatuses(statusMap);

        for (const img of images) {
            if (!statusMap[img]) {
                await addNewDogToSupabase(img);
            }
        }
    }

    async function addNewDogToSupabase(image: string) {
        if (!supabase) return;

        let detectedBreed = 'Unknown';
        const urlParts = image.match(/breeds\/([^\/]+)(?:\/([^\/]+))?/);

        if (urlParts) {
            if (urlParts[2]) {
                detectedBreed = `${urlParts[1]} ${urlParts[2]}`;
            } else {
                detectedBreed = urlParts[1];
            }
        }

        let displayBreed = detectedBreed;
        if (mainBreed) {
            displayBreed = subBreed
                ? `${mainBreed} ${subBreed}`
                : mainBreed;
        }

        const newDog = {
            image_url: image,
            breed: displayBreed,
            status: 'available'
        };

        await supabase.from('dogs').insert([newDog]);

        setDogStatuses(prev => ({
            ...prev,
            [image]: 'available'
        }));
    }

    async function adoptDog(imageUrl: string) {
        if (!supabase) return;

        const { data } = await supabase
            .from('dogs')
            .select('status')
            .eq('image_url', imageUrl);

        if (data && data[0].status == 'adopted') {
            alert('This dog has already been adopted!');
            return;
        }

        if (data) {
            await supabase
                .from('dogs')
                .update({ status: 'adopted' })
                .eq('image_url', imageUrl);
        }

        setDogStatuses({
            ...dogStatuses,
            [imageUrl]: 'adopted'
        });

        alert('Dog adopted successfully!');
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {dogImages.length > 0 ? (
                dogImages.map((dogImage, index) => (
                    <div key={index} className="p-2">
                        <img
                            className="w-full h-48 object-cover"
                            src={dogImage}
                            alt="Dog"
                        />
                        <button
                            className={dogStatuses[dogImage] == 'adopted'
                                ? 'mt-2 px-2 py-1 bg-gray-500 w-full'
                                : 'mt-2 px-2 py-1 bg-blue-600 text-white w-full'}
                            onClick={() => adoptDog(dogImage)}
                            disabled={dogStatuses[dogImage] == 'adopted'}
                        >
                            {dogStatuses[dogImage] == 'adopted' ? 'adopted' : 'adopt'}
                        </button>
                    </div>
                ))
            ) : (
                <p className="col-span-3 text-center">no dogs found.</p>
            )}
        </div>
    );
};

export default FetchDog;