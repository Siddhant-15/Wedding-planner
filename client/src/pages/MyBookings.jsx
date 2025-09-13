import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  Filter,
  Download
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button"; // If you also want to remove Tailwind from these, tell me
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { InlineLoader } from "@/components/ui/loader";

import styles from "../styles/MyBookings.module.css"

const mockBookings = [
  {
    id: "BK001",
    serviceName: "Premium Wedding Photography Package",
    serviceType: "Photography",
    vendorName: "Capture Moments Studio",
    vendorImage: "/src/assets/t-1.jpg",
    date: "2024-03-15",
    time: "10:00 AM",
    location: "Mumbai, Maharashtra",
    price: 75000,
    status: "confirmed",
    rating: 4.8,
    vendorContact: {
      phone: "+91 98765 43210",
      email: "contact@capturemoments.com"
    },
    bookingDate: "2024-01-20"
  },
  {
    id: "BK002",
    serviceName: "Luxury Wedding Venue",
    serviceType: "Venue",
    vendorName: "Royal Gardens Resort",
    vendorImage: "/src/assets/venue-1.jpg",
    date: "2024-03-15",
    time: "6:00 PM",
    location: "Delhi, Delhi",
    price: 250000,
    status: "pending",
    vendorContact: {
      phone: "+91 98765 43211",
      email: "bookings@royalgardens.com"
    },
    bookingDate: "2024-01-22"
  },
  {
    id: "BK003",
    serviceName: "Professional DJ Services",
    serviceType: "DJ",
    vendorName: "Beat Masters",
    vendorImage: "/src/assets/service-dj.jpg",
    date: "2024-02-28",
    time: "8:00 PM",
    location: "Bangalore, Karnataka",
    price: 25000,
    status: "completed",
    rating: 4.5,
    vendorContact: {
      phone: "+91 98765 43212",
      email: "book@beatmasters.in"
    },
    bookingDate: "2024-01-10"
  }
];

export default function MyBookings() {
  const [bookings] = useState(mockBookings);
  const [loading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const getStatusBadge = (status) => {
    return (
      <Badge variant="default" className={styles.badge}>
        {status}
      </Badge>
    );
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filterStatus);

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "price") {
      return b.price - a.price;
    }
    return 0;
  });

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Bookings</h1>
            <p className={styles.subtitle}>
              Manage and track all your service bookings
            </p>
          </div>

          {/* Filters and Controls */}
          <div className={styles.controls}>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className={styles.select}>
                <Filter size={16} className={styles.icon} />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Event Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="bookingDate">Booking Date</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className={styles.exportBtn}>
              <Download size={16} className={styles.icon} />
              Export
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className={styles.tabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming (
                {bookings.filter((b) => b.status === "confirmed").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed (
                {bookings.filter((b) => b.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({bookings.filter((b) => b.status === "pending").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className={styles.tabContent}>
              {loading ? (
                <InlineLoader text="Loading your bookings..." />
              ) : sortedBookings.length === 0 ? (
                <Card className={styles.emptyCard}>
                  <CardContent>
                    <Calendar size={48} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No bookings found</h3>
                    <p className={styles.emptySubtitle}>
                      You haven't made any bookings yet. Start exploring our
                      services!
                    </p>
                    <Button>Browse Services</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={styles.grid}>
                  {sortedBookings.map((booking) => (
                    <Card key={booking.id} className={styles.card}>
                      <CardHeader>
                        <div className={styles.cardHeader}>
                          <div className={styles.vendorInfo}>
                            <img
                              src={booking.vendorImage}
                              alt={booking.vendorName}
                              className={styles.vendorImage}
                            />
                            <div>
                              <CardTitle className={styles.cardTitle}>
                                {booking.serviceName}
                              </CardTitle>
                              <p className={styles.vendorName}>
                                by {booking.vendorName}
                              </p>
                              <Badge variant="secondary" className={styles.serviceType}>
                                {booking.serviceType}
                              </Badge>
                            </div>
                          </div>
                          <div className={styles.priceSection}>
                            {getStatusBadge(booking.status)}
                            <span className={styles.price}>
                              ₹{booking.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className={styles.details}>
                          <div className={styles.detailItem}>
                            <Calendar size={16} />
                            <span>
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <Clock size={16} />
                            <span>{booking.time}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <MapPin size={16} />
                            <span>{booking.location}</span>
                          </div>
                        </div>

                        {booking.rating && booking.status === "completed" && (
                          <div className={styles.rating}>
                            <Star size={16} />
                            <span>{booking.rating}</span>
                            <span className={styles.ratingText}>Your rating</span>
                          </div>
                        )}

                        <div className={styles.actions}>
                          <Button variant="outline" size="sm">
                            <Phone size={16} />
                            Contact Vendor
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail size={16} />
                            Message
                          </Button>
                          {booking.status === "completed" && !booking.rating && (
                            <Button size="sm">
                              <Star size={16} />
                              Rate Service
                            </Button>
                          )}
                          {booking.status === "confirmed" && (
                            <Button variant="destructive" size="sm">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
