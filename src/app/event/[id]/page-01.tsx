"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import FaceStoryBar from "@/src/components/FaceStoryBar";
import { Calendar, Image as ImageIcon } from "lucide-react";

export default function EventPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  
  const [event, setEvent] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    // 1. Get Event Info
    supabase.from("events").select("*").eq("id", id).single().then(({ data }) => setEvent(data));
    
    // 2. Get All Photos
    const fetchPhotos = async () => {
      const { data } = await supabase.from("photos").select("*").eq("event_id", id).order("taken_at", { ascending: false });
      if (data) setAllPhotos(data);
    };
    fetchPhotos();

    // 3. Realtime Photos
    const channel = supabase.channel('main-gallery')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        setAllPhotos(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-6 px-4 text-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">{event.title}</h1>
        <div className="flex justify-center gap-3 text-gray-500 text-xs mt-2">
          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(event.start_time).toLocaleDateString()} - {new Date(event.end_time).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><ImageIcon size={12}/> {allPhotos.length}</span>
        </div>
      </div>

      {/* Sticky Story Bar */}
      <div className="sticky top-0 z-40">
        <FaceStoryBar eventId={id} />
      </div>

      {/* All Photos Grid */}
      <main className="p-1">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {allPhotos.map(photo => (
            <div key={photo.id} className="aspect-square bg-gray-800 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url_thumb} alt="grid" loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}