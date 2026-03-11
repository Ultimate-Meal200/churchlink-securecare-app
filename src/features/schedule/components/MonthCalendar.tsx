import { Pressable, Text, View } from 'react-native';

import { DAY_LABELS, type CalendarDay } from '../../../utils/date';

interface MonthCalendarProps {
  days: CalendarDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function MonthCalendar({ days, selectedDate, onSelectDate }: MonthCalendarProps) {
  return (
    <View className="rounded-[28px] bg-white p-4">
      <View className="mb-4 flex-row">
        {DAY_LABELS.map((label) => (
          <Text key={label} className="flex-1 text-center text-xs font-semibold uppercase tracking-[1px] text-slate">
            {label}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;

          return (
            <Pressable
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              className={`mb-2 h-[76px] rounded-2xl p-2 ${
                isSelected ? 'bg-brand' : day.inMonth ? 'bg-surface' : 'bg-[#EDF1F5]'
              }`}
              style={{ width: '14.2857%' }}
            >
              <View className="flex-1 justify-between">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-white'
                        : day.inMonth
                          ? 'text-brandDark'
                          : 'text-slate'
                    }`}
                  >
                    {day.dayNumber}
                  </Text>
                  {day.isToday ? (
                    <View className={`h-2 w-2 rounded-full ${isSelected ? 'bg-gold' : 'bg-brand'}`} />
                  ) : null}
                </View>

                <View>
                  <Text
                    className={`text-[11px] ${
                      isSelected
                        ? 'text-brandSoft'
                        : day.assignments > 0
                          ? 'text-brandDark'
                          : 'text-slate'
                    }`}
                  >
                    {day.assignments === 0 ? 'Open' : `${day.assignments} assigned`}
                  </Text>
                  {day.confirmed > 0 ? (
                    <Text className={`text-[10px] ${isSelected ? 'text-mint' : 'text-brand'}`}>
                      {day.confirmed} confirmed
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
