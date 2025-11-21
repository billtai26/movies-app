import React, { useState } from 'react';
 

interface Showtime {
  id: string;
  startTime: string;
  price: number;
  theaterId: string;
  roomId: string;
}

interface ShowtimeSelectProps {
  showtimes: Showtime[];
  selectedDate: Date;
  onSelect: (showtimeId: string) => void;
}

export const ShowtimeSelect: React.FC<ShowtimeSelectProps> = ({
  showtimes,
  selectedDate,
  onSelect,
}) => {
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');

  const handleSelect = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
    onSelect(showtimeId);
  };

  // Group showtimes by theater
  const showtimesByTheater = showtimes.reduce((acc, showtime) => {
    if (!acc[showtime.theaterId]) {
      acc[showtime.theaterId] = [];
    }
    acc[showtime.theaterId].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-6">
        {Object.entries(showtimesByTheater).map(([theaterId, theaterShowtimes]) => (
          <div key={theaterId} className="border-b pb-4 last:border-b-0">
            <h3 className="text-lg font-semibold mb-3">
              {theaterId === 't1' ? 'Galaxy Nguyễn Du' : 'Galaxy Kinh Dương Vương'}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {theaterShowtimes
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((showtime) => (
                  <button
                    key={showtime.id}
                    onClick={() => handleSelect(showtime.id)}
                    className={`p-3 rounded text-center transition-all ${
                      selectedShowtime === showtime.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {(showtime.price / 1000).toFixed(0)}k
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
