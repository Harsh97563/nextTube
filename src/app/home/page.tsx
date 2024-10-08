'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'
import { GetSearchData, GetSubscribtionData } from '../api/auth/youtubeapi';
import { useSession } from 'next-auth/react';

function timeago(publishedAt: string | number | Date): string {
  const publishedDate = new Date(publishedAt);
  const currentDate = new Date();
  const differenceInSeconds = Math.floor((currentDate.getTime() - publishedDate.getTime())/1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(differenceInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

const Homepage: React.FC = () => {
  const [searchData, setSearchData] = useState<Video[]>([]);
  const [userSubscribedChannels, setuserSubscribedChannels] = useState<{}[]>([])
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const userSession =  useSession();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetSearchData(searchTerm);
        setSearchData(data|| []);
        if(userSession.data) {
          const response = await GetSubscribtionData(userSession.data);
          if(response) setuserSubscribedChannels(response.items);
        }
        
      } catch (error) {
        console.error('Error fetching the search data:', error);
        setSearchData([]); 
      }
    };

    fetchData();

  }, [searchTerm, userSession.data]);
  
  return (
    <div className="p-4 w-full">  
      {/* Video Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 xl:grid-cols-4 justify-center">
        {searchData.map((video) => (
          <Link href={`${video.id.videoId}/?id=${video.id.videoId}`}
          key={video.id.videoId}
          className=' w-full overflow-hidden rounded-lg' 
          >
          <div
            key={video.id.videoId}
            className="flex flex-col gap-2  rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-[full] h-60  md:h-72"
          >
            {/* Thumbnail */}
            <div className='relative w-full h-full'>
              <Image
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                fill
                sizes='h-full'
                className="rounded-lg"
                
              />
            </div>

            {/* Video Info */}
            <div className="">
              <h3 className="font-semibold  text-md truncate">{video.snippet.title}</h3>
              <div className='flex justify-between text-[14px]'>
                <p className="">{video.snippet.channelTitle}</p>
                <p className="">
                  {timeago(video.snippet.publishedAt)}
                </p>
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Homepage;

