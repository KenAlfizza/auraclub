import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, Check, UserPlus, ClipboardList, Users, User, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEvent } from "@/context/EventContext";

export function ManageGuestsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    guests,
    rsvps,
    fetchGuests,
    fetchRSVPs,
    addGuest,
    removeGuest,
    rsvpUser,
    cancelUserRSVP,
    markAttendance,
    resolveUserId,
    loading,
    error,
  } = useEvent();

  const [guestUtorid, setGuestUtorid] = useState("");
  const [rsvpUtorid, setRsvpUtorid] = useState("");
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [targetType, setTargetType] = useState("guest");

  useEffect(() => {
    if (id) {
      fetchGuests(id).catch(err => setMessage(err.message));
      fetchRSVPs(id).catch(err => setMessage(err.message));
    }
  }, [id]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddGuest = async () => {
    if (!guestUtorid.trim()) return showMessage("Please enter a UTORid");
    try {
      const userId = await resolveUserId(guestUtorid.trim());
      await addGuest(id, userId);
      showMessage("Guest added successfully!");
      setGuestUtorid("");
      await fetchGuests(id);
    } catch (err) {
      showMessage(err.message || "Failed to add guest");
    }
  };

  const handleRSVPUser = async () => {
    if (!rsvpUtorid.trim()) return showMessage("Please enter a UTORid");
    try {
      const userId = await resolveUserId(rsvpUtorid.trim());
      await rsvpUser(id, userId);
      showMessage("User RSVP'd successfully!");
      setRsvpUtorid("");
      await fetchRSVPs(id);
    } catch (err) {
      showMessage(err.message || "Failed to RSVP user");
    }
  };

  const handleCancel = (utorid, type) => {
    setTargetUser(utorid);
    setTargetType(type);
    setDeleteDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!targetUser) return;
    try {
      const userId = await resolveUserId(targetUser);
      if (targetType === "guest") {
        await removeGuest(id, userId);
        showMessage("Guest removed successfully!");
        await fetchGuests(id);
      } else {
        await cancelUserRSVP(id, userId);
        showMessage("RSVP canceled successfully!");
        await fetchRSVPs(id);
      }
    } catch (err) {
      showMessage(err.message || "Failed to perform action");
    } finally {
      setDeleteDialogOpen(false);
      setTargetUser(null);
      setTargetType("guest");
    }
  };

  const handleMarkAttendance = async (utorid) => {
    try {
      const userId = await resolveUserId(utorid);
      await markAttendance(id, userId);
      showMessage("Attendance marked successfully!");
      await fetchGuests(id);
      await fetchRSVPs(id);
    } catch (err) {
      showMessage(err.message || "Failed to mark attendance");
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <div 
            className="rounded-full hover:bg-gray-100 p-2 cursor-pointer flex items-center justify-center"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-8 h-8 text-gray-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Guests & RSVPs</h1>
            <p className="text-gray-500 mt-1">
              Add guests, RSVP users, or mark attendance for this event
            </p>
          </div>
        </div>

        {/* Message */}
        {(message || error) && (
          <div
            className={`w-full p-4 rounded-lg border ${
              message.includes("successfully") 
                ? "bg-green-50 text-green-800 border-green-200" 
                : "bg-red-50 text-red-800 border-red-200"
            } flex items-center gap-2 shadow-sm`}
          >
            {message.includes("successfully") ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message || error}</span>
          </div>
        )}

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Guest */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <Label className="text-lg font-semibold text-gray-900">Add Guest</Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter guest UTORid" 
                  value={guestUtorid} 
                  onChange={e => setGuestUtorid(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  onClick={handleAddGuest} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RSVP Users */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <Label className="text-lg font-semibold text-gray-900">RSVP User</Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter user UTORid to RSVP" 
                  value={rsvpUtorid} 
                  onChange={e => setRsvpUtorid(e.target.value)}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <Button 
                  onClick={handleRSVPUser} 
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
                >
                  RSVP
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guests List */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Label className="text-xl font-semibold text-gray-900">Guests</Label>
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {guests.length}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : guests.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No guests yet</p>
                <p className="text-gray-400 text-sm">Add your first guest above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {guests.map(g => (
                <Card key={g.utorid} className="shadow-sm hover:shadow-md transition-all border-gray-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{g.name}</span>
                        <span className="text-gray-500 text-sm">{g.utorid}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCancel(g.utorid, "guest")} 
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RSVP List */}
        <div className="flex flex-col gap-4 w-full mt-6">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <Label className="text-xl font-semibold text-gray-900">RSVPs (Pending Attendance)</Label>
            <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              {rsvps.length}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : rsvps.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <ClipboardList className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No RSVPs yet</p>
                <p className="text-gray-400 text-sm">RSVP users above to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {rsvps.map(r => (
                <Card key={r.utorid} className="shadow-sm hover:shadow-md transition-all border-gray-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{r.name}</span>
                        <span className="text-gray-500 text-sm">{r.utorid}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAttendance(r.utorid)} 
                        disabled={loading} 
                        className="bg-green-600 hover:bg-green-700 text-white font-medium"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Present
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCancel(r.utorid, "rsvp")} 
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this action? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setTargetUser(null); setTargetType("guest"); }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

export default ManageGuestsPage;