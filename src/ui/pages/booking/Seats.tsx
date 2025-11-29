import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api } from "../../../lib/backendApi";
import SeatMap from "../../components/SeatMap";
import BookingBreadcrumb from "../../components/BookingBreadcrumb";
import Countdown from "../../components/Countdown";
import { useAuth } from "../../../store/auth";
import { toast } from "react-toastify";

type SeatState = "empty" | "held" | "booked" | "selected";
type Seat = {
  id: string;
  row: string;
  col: number;
  type: "normal" | "vip" | "couple";
  state: SeatState;
  userId?: string;
  price: number;
};

const HOLD_DURATION_SECONDS = 420;

export default function Seats() {
  const { id: showtimeId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const incomingSelected = (location.state as any)?.selected || [];

  const { _id, email } = useAuth();
  const myUserId = _id || email || "";

  const [st, setSt] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableShows, setAvailableShows] = useState<any[]>([]);
  const [limitOpen, setLimitOpen] = useState(false);
  const [needSelectOpen, setNeedSelectOpen] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(HOLD_DURATION_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================= LOAD SHOWTIME =============================
  useEffect(() => {
    if (!showtimeId) return;

    api
      .getShowtime(showtimeId)
      .then((showtimeDetails: any) => {
        setSt(showtimeDetails);

        if (showtimeDetails?.seats) {
          const toSeat = (seatObj: any): Seat => {
            const sn = seatObj.seatNumber;
            const status = seatObj.status;
            const heldBy = seatObj.heldBy;
            const price = seatObj.price;

            const row = sn.replace(/\d+/, "");
            const col = Number(sn.replace(/\D+/, ""));

            let state: SeatState = "empty";
            const isSaved = incomingSelected.includes(sn);

            if (status === "booked") state = "booked";
            else if (isSaved) state = "selected";
            else if (heldBy) state = heldBy === myUserId ? "selected" : "held";

            return {
              id: sn,
              row,
              col,
              type: "normal",
              state,
              userId: state === "selected" ? myUserId : heldBy,
              price,
            };
          };

          setSeats(showtimeDetails.seats.map(toSeat));
        }

        // Load movie
        api.getMovie(showtimeDetails.movieId).then(setMovie);

        // Load theater
        api
          .listTheaters()
          .then((res: any) => {
            const list = Array.isArray(res) ? res : res.cinemas || [];
            const t = list.find(
              (x: any) =>
                String(x._id || x.id) ===
                String(showtimeDetails.theaterId || showtimeDetails.cinemaId)
            );
            setTheater(t);
          })
          .catch(() => {});

        // Load room
        api
          .listRooms()
          .then((res: any) => {
            const list = Array.isArray(res) ? res : res.cinemaHalls || [];
            const r = list.find(
              (x: any) =>
                String(x._id || x.id) === String(showtimeDetails.roomId)
            );
            setRoom(r);
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, [showtimeId, myUserId]);

  // ============================= SOCKET =============================
  useEffect(() => {
    if (!showtimeId || !myUserId) return;

    const newSocket = io("http://localhost:8017");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", showtimeId);
    });

    newSocket.on("seat:updated", (updatedSeat: Seat) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (s.id !== updatedSeat.id) return s;

          if (updatedSeat.state === "held") {
            return updatedSeat.userId === myUserId
              ? { ...s, state: "selected", userId: myUserId }
              : { ...s, state: "held", userId: updatedSeat.userId };
          }

          if (updatedSeat.state === "empty") {
            return { ...s, state: "empty", userId: undefined };
          }

          return { ...s, state: updatedSeat.state, userId: updatedSeat.userId };
        })
      );
    });

    newSocket.on("seats:booked", (bookedSeatIds: string[]) => {
      setSeats((prev) =>
        prev.map((s) =>
          bookedSeatIds.includes(s.id) ? { ...s, state: "booked" } : s
        )
      );
    });

    return () => newSocket.disconnect();
  }, [showtimeId, myUserId]);

  // ============================= SELECTED SEATS =============================
  const mySelectedSeats = useMemo(
    () => seats.filter((s) => s.state === "selected" && s.userId === myUserId),
    [seats, myUserId]
  );

  const mySelectedSeatIds = useMemo(
    () => mySelectedSeats.map((s) => s.id),
    [mySelectedSeats]
  );

  // ============================= SUMMARY =============================
  const summary = useMemo(() => {
    const selected = mySelectedSeats;

    if (selected.length === 0) {
      return {
        singles: 0,
        singleIds: [],
        pricePerSeat: 0,
        total: 0,
      };
    }

    const singleIds = selected.map((s) => s.id);
    const avgPrice = Math.round(
      selected.reduce((sum, s) => sum + s.price, 0) / selected.length
    );

    const total = selected.reduce((sum, s) => sum + s.price, 0);

    return {
      singles: singleIds.length,
      singleIds,
      pricePerSeat: avgPrice,
      total,
    };
  }, [mySelectedSeats]);

  // ============================= RELEASE ALL =============================
  const releaseAllMySeats = (notify = true) => {
    if (!socket || mySelectedSeatIds.length === 0) return;

    socket.emit("seat:release_many", {
      showtimeId,
      seatIds: mySelectedSeatIds,
      userId: myUserId,
    });

    api.releaseSeats?.(showtimeId!, mySelectedSeatIds).catch(() => {});

    setSeats((prev) =>
      prev.map((s) =>
        mySelectedSeatIds.includes(s.id)
          ? { ...s, state: "empty", userId: undefined }
          : s
      )
    );

    if (notify) toast.info("Đã hết thời gian giữ ghế.");
  };

  // ============================= TIMER =============================
  useEffect(() => {
    if (mySelectedSeats.length > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSecondsLeft((sec) => {
            if (sec <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              releaseAllMySeats(true);
              nav("/movies");
              return 0;
            }
            return sec - 1;
          });
        }, 1000);
      }
    } else {
      clearInterval(timerRef.current!);
      timerRef.current = null;
      setSecondsLeft(HOLD_DURATION_SECONDS);
    }

    return () => {
      clearInterval(timerRef.current!);
      timerRef.current = null;
    };
  }, [mySelectedSeats.length]);

  // ============================= CLICK SEAT =============================
  const handleToggle = async (seatId: string) => {
    if (!myUserId) {
      toast.warning("Vui lòng đăng nhập!");
      return;
    }

    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;
    if (seat.state === "booked") return;
    if (seat.state === "held" && seat.userId !== myUserId) return;

    try {
      if (seat.state === "empty") {
        if (mySelectedSeats.length >= 8) {
          setLimitOpen(true);
          return;
        }

        await api.holdSeats(showtimeId!, [seatId]);

        setSeats((prev) =>
          prev.map((s) =>
            s.id === seatId
              ? { ...s, state: "selected", userId: myUserId }
              : s
          )
        );

        socket?.emit("seat:hold", { showtimeId, seatId, userId: myUserId });
      } else if (seat.state === "selected") {
        await api.releaseSeats(showtimeId!, [seatId]);

        setSeats((prev) =>
          prev.map((s) =>
            s.id === seatId
              ? { ...s, state: "empty", userId: undefined }
              : s
          )
        );

        socket?.emit("seat:release", { showtimeId, seatId, userId: myUserId });
      }
    } catch (err: any) {
      toast.error("Lỗi thao tác ghế!");
      api.getShowtime(showtimeId!).then((d: any) => setSt(d));
    }
  };

  // ============================= RENDER =============================
  const formatDateLabel = (dateStr: string) => {
    const dt = new Date(dateStr);
    const weekdays = [
      "Chủ nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return `${weekdays[dt.getDay()]}, ${String(dt.getDate()).padStart(
      2,
      "0"
    )}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };

  if (!st || !seats.length)
    return (
      <div className="flex items-center justify-center h-96">
        Loading...
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr_400px]">
      <div className="md:col-span-3">
        <BookingBreadcrumb currentStep="seats" />
      </div>

      {/* LEFT */}
      <div className="md:col-span-2 space-y-4">
        <div className="card p-4">
          <SeatMap
            seats={seats}
            aisleCols={[7]}
            aisleRows={["D", "G"]}
            maxSelected={8}
            onLimitExceeded={() => setLimitOpen(true)}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* RIGHT SUMMARY */}
      <div className="space-y-4 md:sticky md:top-4">
        <div className="card p-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Thời gian giữ ghế:</span>
            <Countdown secondsLeft={secondsLeft} autoRun={false} />
          </div>

          <div className="flex gap-4">
            <img src={movie?.poster} className="h-48 w-32 rounded-lg" />
            <div>
              <div className="text-xl font-semibold">{movie?.title}</div>
            </div>
          </div>

          <div className="opacity-80 mt-2">
            {theater?.name} {room?.name && `- ${room.name}`}
          </div>

          <div className="opacity-80">
            Suất: {selectedTime} – {formatDateLabel(st.startTime)}
          </div>

          <hr className="my-3 border-dashed" />

          {summary.singles > 0 && (
            <>
              <div className="flex justify-between">
                <span>{summary.singles}x Ghế đơn</span>
                <b>{summary.pricePerSeat.toLocaleString()} đ</b>
              </div>
              <div className="text-xs opacity-70">
                Ghế: {summary.singleIds.join(", ")}
              </div>
            </>
          )}

          {summary.singles === 0 && (
            <div className="text-xs opacity-60">Ghế: Chưa chọn</div>
          )}

          <hr className="my-3 border-dashed" />

          <div className="flex justify-between text-xl font-bold">
            <span>Tổng cộng</span>
            <b className="text-orange-600">
              {summary.total.toLocaleString()} đ
            </b>
          </div>
        </div>

        <div className="flex justify-between mt-3">
          <button className="btn-back" onClick={() => nav("/booking/select")}>
            Quay lại
          </button>

          <button
            className="btn-next"
            onClick={() => {
              if (mySelectedSeats.length === 0) {
                setNeedSelectOpen(true);
                return;
              }
              nav("/booking/combos", {
                state: {
                  id: showtimeId,
                  selected: mySelectedSeatIds,
                },
              });
            }}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
