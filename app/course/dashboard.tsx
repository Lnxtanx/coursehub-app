import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width, height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
};

const IconText = ({ children }: { children: string }) => {
  const { theme } = useTheme();
  return <Text style={{ color: theme.text }}>{children}</Text>;
};

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList>(null);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    fetchUserProfile();
    fetchCourses();
  }, []);

  // Auto-sliding effect
  useEffect(() => {
    if (courses.length > 0) {
      const slideTimer = setInterval(() => {
        if (currentIndex < courses.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
          setCurrentIndex(currentIndex + 1);
        } else {
          flatListRef.current?.scrollToIndex({
            index: 0,
            animated: true,
          });
          setCurrentIndex(0);
        }
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(slideTimer);
    }
  }, [currentIndex, courses.length]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First try to get the user profile
      let { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // If the profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
              email: user.email,
            }
          ])
          .select('full_name')
          .single();

        if (createError) throw createError;
        data = newUser;
      } else if (error) {
        throw error;
      }

      if (data) setUserName(data.full_name);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 48));
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }
    }
  );

  const renderCourseCard = ({ item, index }: { item: Course; index: number }) => {
    const inputRange = [
      (index - 1) * (screenWidth - 48),
      index * (screenWidth - 48),
      (index + 1) * (screenWidth - 48),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/course/play', params: { id: item.id } })}
        style={styles.courseCard}
      >
        <Animated.View style={[styles.cardContent, { transform: [{ scale }], backgroundColor: theme.card, shadowColor: theme.text }]}>
          <Text style={[styles.courseTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.courseDescription, { color: theme.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const stats = [
    { icon: 'book-outline', label: 'Courses', value: courses.length },
    { icon: 'time-outline', label: 'Hours', value: '24+' },
    { icon: 'trophy-outline', label: 'Certificates', value: '3' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.welcomeContainer}>
          <Text style={[styles.greeting, { color: theme.text }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{userName || 'Student'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: theme.card }]}
          onPress={() => router.push('/profile/profile')}
        >
          <Ionicons name="person-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View 
              key={index} 
              style={[styles.statCard, { backgroundColor: theme.card }]}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name={stat.icon as any} size={24} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Featured Courses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Courses</Text>
          <Animated.FlatList
            ref={flatListRef}
            data={courses}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}            onMomentumScrollEnd={(ev) => {
              const newIndex = Math.round(ev.nativeEvent.contentOffset.x / (width - 40));
              setCurrentIndex(newIndex);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => router.push(`/course/play?id=${item.id}`)}
              >
                <View style={[styles.courseCardContent, { backgroundColor: theme.card }]}>
                  <View style={[styles.courseIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                    <Ionicons name="school-outline" size={32} color={theme.primary} />
                  </View>
                  <Text style={[styles.courseTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.courseDescription, { color: theme.secondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelBadgeColor(item.level) }]}>
                    <Text style={styles.levelText}>{item.level}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {courses.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: currentIndex === index ? theme.primary : theme.secondary + '40' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'search-outline', label: 'Browse Courses', route: '/course/courses' },
              { icon: 'cart-outline', label: 'Buy Course', route: '/payment/payment' },
              { icon: 'bookmark-outline', label: 'Saved', route: '/course/courses' },
              { icon: 'settings-outline', label: 'Settings', route: '/profile/profile' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={theme.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    zIndex: 0,
  },
  welcomeContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  statCard: {
    width: screenWidth * 0.27,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  courseCard: {
    width: screenWidth - 40,
    paddingHorizontal: 20,
  },
  courseCardContent: {
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: screenWidth * 0.42,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

function getLevelBadgeColor(level: string) {
  switch (level.toLowerCase()) {
    case 'beginner':
      return '#10b981';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#ef4444';
    default:
      return '#6366f1';
  }
}