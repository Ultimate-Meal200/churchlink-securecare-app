import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { assignMemberToSchedule, loadScheduleSnapshot } from '../api';
import { MonthCalendar } from '../components/MonthCalendar';
import type { Ministry, Profile, Schedule, ScheduleSnapshot } from '../types';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { addMonths, buildCalendarDays, monthLabel, startOfMonth, toIsoDate } from '../../../utils/date';

const emptySnapshot: ScheduleSnapshot = {
  members: [],
  ministries: [],
  schedules: [],
};

const cardStyle = {
  shadowColor: '#102033',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 3,
};

function nameForProfile(profileId: string, members: Profile[]) {
  return members.find((member) => member.id === profileId)?.name ?? 'Unknown member';
}

function nameForMinistry(ministryId: string, ministries: Ministry[]) {
  return ministries.find((ministry) => ministry.id === ministryId)?.name ?? 'Unknown ministry';
}

export function LeaderDashboardScreen() {
  const [monthAnchor, setMonthAnchor] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [snapshot, setSnapshot] = useState<ScheduleSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        setLoading(true);
        setErrorMessage('');
        const result = await loadScheduleSnapshot(monthAnchor);

        if (!isMounted) {
          return;
        }

        setSnapshot(result);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load the schedule.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [monthAnchor]);

  useEffect(() => {
    const assignableMembers = snapshot.members.filter((member) => member.role !== 'Admin');

    if (assignableMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(assignableMembers[0].id);
    }

    if (snapshot.ministries.length > 0 && !selectedMinistryId) {
      setSelectedMinistryId(snapshot.ministries[0].id);
    }
  }, [snapshot.members, snapshot.ministries, selectedMemberId, selectedMinistryId]);

  const assignableMembers = snapshot.members.filter((member) => member.role !== 'Admin');
  const calendarDays = buildCalendarDays(monthAnchor, snapshot.schedules);
  const selectedDayAssignments = snapshot.schedules.filter((schedule) => schedule.date === selectedDate);
  const selectedMember = assignableMembers.find((member) => member.id === selectedMemberId);
  const selectedMinistry = snapshot.ministries.find((ministry) => ministry.id === selectedMinistryId);
  const assignmentConflict = snapshot.schedules.some(
    (schedule) => schedule.member_id === selectedMemberId && schedule.date === selectedDate,
  );

  const totalAssignments = snapshot.schedules.length;
  const confirmedAssignments = snapshot.schedules.filter((schedule) => schedule.status === 'Confirmed').length;
  const pendingAssignments = snapshot.schedules.filter((schedule) => schedule.status === 'Pending').length;

  function jumpMonth(direction: number) {
    const next = addMonths(monthAnchor, direction);
    setMonthAnchor(next);
    setSelectedDate(toIsoDate(next));
  }

  async function handleAssign() {
    if (!selectedMemberId || !selectedMinistryId) {
      return;
    }

    if (assignmentConflict) {
      Alert.alert('Member already scheduled', 'Members cannot be scheduled twice on the same day.');
      return;
    }

    try {
      setSubmitting(true);
      const schedule = await assignMemberToSchedule({
        memberId: selectedMemberId,
        ministryId: selectedMinistryId,
        assignmentDate: selectedDate,
      });

      setSnapshot((current) => ({
        ...current,
        schedules: [schedule, ...current.schedules].sort((left, right) =>
          left.date.localeCompare(right.date),
        ),
      }));

      Alert.alert(
        'Assignment created',
        `${selectedMember?.name ?? 'Member'} was added to ${selectedMinistry?.name ?? 'the ministry'} on ${selectedDate}.`,
      );
    } catch (error) {
      Alert.alert(
        'Unable to assign member',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-brandDark px-5 pb-8 pt-4">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-brandSoft">
            Leader Dashboard
          </Text>
          <Text className="mt-3 text-4xl font-bold text-white">Monthly Schedule</Text>
          <Text className="mt-3 max-w-[320px] text-base leading-6 text-brandSoft">
            Assign ministry coverage, prevent double-booking, and queue 14-day reminders from one view.
          </Text>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-[1px] text-brandSoft">This Month</Text>
              <Text className="mt-2 text-3xl font-bold text-white">{totalAssignments}</Text>
              <Text className="mt-1 text-sm text-brandSoft">total assignments</Text>
            </View>
            <View className="flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-[1px] text-brandSoft">Confirmed</Text>
              <Text className="mt-2 text-3xl font-bold text-white">{confirmedAssignments}</Text>
              <Text className="mt-1 text-sm text-brandSoft">{pendingAssignments} pending</Text>
            </View>
          </View>
        </View>

        <View className="-mt-4 px-5">
          {!isSupabaseConfigured ? (
            <View className="mb-4 rounded-3xl border border-brandSoft bg-white px-4 py-4">
              <Text className="text-sm font-semibold text-brandDark">Preview mode</Text>
              <Text className="mt-1 text-sm leading-6 text-slate">
                Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to connect live data.
              </Text>
            </View>
          ) : null}

          <View className="rounded-[32px] border border-[#E3EAF2] bg-white p-5" style={cardStyle}>
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate">
                  Calendar
                </Text>
                <Text className="mt-1 text-2xl font-bold text-brandDark">{monthLabel(monthAnchor)}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => jumpMonth(-1)}
                  className="h-11 w-11 items-center justify-center rounded-2xl bg-surface"
                >
                  <Text className="text-lg font-bold text-brandDark">‹</Text>
                </Pressable>
                <Pressable
                  onPress={() => jumpMonth(1)}
                  className="h-11 w-11 items-center justify-center rounded-2xl bg-brand"
                >
                  <Text className="text-lg font-bold text-white">›</Text>
                </Pressable>
              </View>
            </View>

            {loading ? (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color="#0F4C81" />
                <Text className="mt-4 text-sm text-slate">Loading assignments...</Text>
              </View>
            ) : errorMessage ? (
              <View className="rounded-3xl bg-[#FFF1F1] px-4 py-5">
                <Text className="text-base font-semibold text-danger">Schedule load failed</Text>
                <Text className="mt-2 text-sm leading-6 text-danger">{errorMessage}</Text>
              </View>
            ) : (
              <MonthCalendar
                days={calendarDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </View>

          <View className="mt-5 rounded-[32px] border border-[#E3EAF2] bg-white p-5" style={cardStyle}>
            <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate">
              Assign Coverage
            </Text>
            <Text className="mt-1 text-2xl font-bold text-brandDark">{selectedDate}</Text>

            <View className="mt-5 gap-4">
              <View>
                <Text className="mb-2 text-sm font-semibold text-brandDark">Ministry</Text>
                <View className="overflow-hidden rounded-2xl bg-surface">
                  <Picker
                    selectedValue={selectedMinistryId}
                    onValueChange={(value) => setSelectedMinistryId(String(value))}
                  >
                    {snapshot.ministries.map((ministry) => (
                      <Picker.Item key={ministry.id} label={ministry.name} value={ministry.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-brandDark">Member</Text>
                <View className="overflow-hidden rounded-2xl bg-surface">
                  <Picker
                    selectedValue={selectedMemberId}
                    onValueChange={(value) => setSelectedMemberId(String(value))}
                  >
                    {assignableMembers.map((member) => (
                      <Picker.Item
                        key={member.id}
                        label={`${member.name} · ${member.role}`}
                        value={member.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View
              className={`mt-4 rounded-2xl px-4 py-4 ${
                assignmentConflict ? 'bg-[#FFF1F1]' : 'bg-mint'
              }`}
            >
              <Text className={`text-sm font-semibold ${assignmentConflict ? 'text-danger' : 'text-brandDark'}`}>
                {assignmentConflict
                  ? 'This member already has an assignment on the selected date.'
                  : 'This assignment will be created as Pending and queue a reminder 14 days before service.'}
              </Text>
            </View>

            <Pressable
              onPress={handleAssign}
              disabled={submitting || assignmentConflict || !selectedMemberId || !selectedMinistryId}
              className={`mt-5 items-center rounded-2xl px-4 py-4 ${
                submitting || assignmentConflict || !selectedMemberId || !selectedMinistryId
                  ? 'bg-[#B9C5D2]'
                  : 'bg-brand'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Assign Member</Text>
              )}
            </Pressable>
          </View>

          <View className="mt-5 rounded-[32px] border border-[#E3EAF2] bg-white p-5" style={cardStyle}>
            <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate">
              Selected Day
            </Text>
            <Text className="mt-1 text-2xl font-bold text-brandDark">{selectedDate}</Text>

            {selectedDayAssignments.length === 0 ? (
              <Text className="mt-4 text-sm leading-6 text-slate">
                No one is assigned yet. Pick a ministry and member above to fill this slot.
              </Text>
            ) : (
              <View className="mt-4 gap-3">
                {selectedDayAssignments.map((schedule: Schedule) => (
                  <View key={schedule.id} className="rounded-2xl bg-surface px-4 py-4">
                    <Text className="text-base font-semibold text-brandDark">
                      {nameForProfile(schedule.member_id, snapshot.members)}
                    </Text>
                    <Text className="mt-1 text-sm text-slate">
                      {nameForMinistry(schedule.ministry_id, snapshot.ministries)}
                    </Text>
                    <Text className="mt-3 text-xs font-semibold uppercase tracking-[1px] text-brand">
                      {schedule.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
