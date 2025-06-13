import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type Course = {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
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
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'leaf-outline';
      case 'intermediate':
        return 'star-half-outline';
      case 'advanced':
        return 'trophy-outline';
      default:
        return 'school-outline';
    }
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={[styles.courseCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/course/play?id=${item.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={30} color="#0ea5e9" />
        </View>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseTitle, { color: theme.text }]}>{item.title}</Text>          <Text style={[styles.courseDescription, { color: theme.secondary }]}>
            {item.description}
          </Text>
          <View style={styles.courseMetadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="time-outline" size={16} color={theme.secondary} />
              <Text style={[styles.metadataText, { color: theme.secondary }]}>
                {item.duration} hours
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
              <Ionicons name={getLevelIcon(item.level) as any} size={14} color="#fff" />
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Available Courses</Text>        <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>
          Choose from our selection of expert-led courses
        </Text>
      </View>
      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    padding: 20,
  },
  courseCard: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 4,
    fontSize: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});