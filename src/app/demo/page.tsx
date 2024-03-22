// src/pages/page.tsx
import JoinGameCard from '@/components/JoinGameCard';
import LogoComponent from '@/components/LogoComponent';
import PhoneOverlay from '@/components/PhoneOverlay';
import { Button } from "@/components/ui/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Heart } from 'lucide-react';
import { Repeat2 } from 'lucide-react';
import { Bookmark } from 'lucide-react';





export default function Page() {
  return (
    <div>
      <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
        <LogoComponent />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <PhoneOverlay>
          <h1 className='text-2xl font-bold'>Convo</h1>
          <Button>Hello!</Button>
          <ToggleGroup type="single">
          <div className="flex flex-col items-center">
            <ToggleGroupItem value="bold" aria-label="Toggle bold" className='m-2 h-full'>
            <div className="flex items-center w-full">
                        <div style={{ 
                            width: '30px',
                            height: '30px',
                            minWidth: '30px',
                            minHeight: '30px',
                            backgroundColor: 'grey',
                            borderRadius: '50%'
                        }}></div>
                        <div className="comment-text ml-3">
                            <h4 className="text-md font-semibold">AnonUser</h4>
                            <h5 className="text-sm">Hello! This is my comment. It's so refreshing to meet other fellow humans!</h5>
                            <div className='flex  space'><Heart className='w-3 h-3' /><h5 className='text-xs'>15k</h5> <Repeat2 className='w-3 h-3' /></div>
                        </div>
                    </div>

            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic" className='m-2 h-full'>
            <div className="flex items-center">
                        <div style={{ 
                            width: '30px',
                            height: '30px',
                            minWidth: '30px',
                            minHeight: '30px',
                            backgroundColor: 'grey',
                            borderRadius: '50%'
                        }}></div>
                        <div className="comment-text ml-3">
                            <h4 className="text-md font-semibold">AnonUser</h4>
                            <h5 className="text-sm">Hello!</h5>
                        </div>
                    </div>
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline" className='m-2 h-full'>
            <div className="flex items-center">
                        <div style={{ 
                            width: '30px',
                            height: '30px',
                            minWidth: '30px',
                            minHeight: '30px',
                            backgroundColor: 'grey',
                            borderRadius: '50%'
                        }}></div>
                        <div className="comment-text ml-3">
                            <h4 className="text-md font-semibold">AnonUser</h4>
                            <h5 className="text-sm">Hello!</h5>
                        </div>
                    </div>

            </ToggleGroupItem>
            </div>
          </ToggleGroup>


        </PhoneOverlay>
        <div className='ml-8 w-1/3'>
          <h1 className='text-3xl font-semibold'>Which of these was written by an AI?</h1>
          <h2 className='mt-2'>Get it wrong? Don’t blame yourself. These days, it can be impossible to tell. </h2>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
        <div className="flex justify-center items-center h-full">
          <h2 className="text-xs text-gray-400">created by: creatorblue32</h2>
        </div>
      </div>
    </div>

  );
}

