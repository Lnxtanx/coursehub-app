import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

type CourseContent = {
  id: number;
  course_id: number;
  title: string;
  notes: string;
  video_url: string;
  article_link: string;
};

export default function PlayCourse() {
  const [content, setContent] = useState<CourseContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { id: courseId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setContent(data);
        setCurrentContent(data[0]); // Set first video as default
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course content:', error);
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (videoUrl: string) => {
    // Handle YouTube URLs
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle Vimeo URLs
    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.text }}>Loading course content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentContent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorText, { color: theme.error }]}>No content available for this course.</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: '#ffffff' }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainHeader, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Course Content</Text>
        </View>

        <View style={[styles.videoContainer, { backgroundColor: '#000' }]}>
          <WebView
            style={styles.video}
            source={{ uri: getVideoEmbedUrl(currentContent.video_url) }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{currentContent.title}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Course Notes</Text>
          <Text style={[styles.notes, { color: theme.text }]}>{currentContent.notes}</Text>
        </View>

        {currentContent.article_link && (
          <TouchableOpacity
            style={[styles.articleButton, { 
              backgroundColor: theme.background,
              borderColor: theme.primary 
            }]}
            onPress={() => Linking.openURL(currentContent.article_link)}
          >
            <Text style={[styles.articleButtonText, { color: theme.primary }]}>Read Additional Article</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.playlistSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Course Content</Text>
          <ScrollView style={styles.playlist}>
            {content.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.playlistItem,
                  { backgroundColor: theme.background },
                  currentContent.id === item.id && { backgroundColor: theme.primary }
                ]}
                onPress={() => setCurrentContent(item)}
              >
                <Text 
                  style={[
                    styles.playlistItemText,
                    { color: theme.text },
                    currentContent.id === item.id && { color: '#ffffff' }
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <View style={[styles.footerPattern, { backgroundColor: theme.secondary }]} />
          <Text style={[styles.footerText, { color: theme.secondary }]}>Crafted by Vivek</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const videoHeight = (width * 9) / 16; // 16:9 aspect ratio
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backBtnText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontWeight: '500',
  },
  videoContainer: {
    width: '100%',
    height: videoHeight,
  },
  video: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
  },
  articleButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  articleButtonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  playlistSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  playlist: {
    maxHeight: 200,
  },
  playlistItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistItemText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'flex-start',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 16,
    position: 'relative',
    zIndex: 2,
  },
  footerPattern: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    width: 40,
    height: 40,
    opacity: 0.1,
    transform: [{ rotate: '45deg' }],
  },
});