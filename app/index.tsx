import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const courseCategories = [
  {
    id: 1,
    title: 'Web Development',
    icon: 'globe-outline',
    description: 'Master modern web technologies',
    courses: ['React.js', 'Node.js', 'Next.js', 'Full Stack'],
    color: '#3b82f6',
  },
  {
    id: 2,
    title: 'Artificial Intelligence',
    icon: 'hardware-chip-outline',
    description: 'Explore the world of AI & ML',
    courses: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision'],
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: 'Programming Languages',
    icon: 'code-slash-outline',
    description: 'Learn in-demand languages',
    courses: ['Python', 'Java', 'JavaScript', 'TypeScript'],
    color: '#10b981',
  },
  {
    id: 4,
    title: 'Mobile Development',
    icon: 'phone-portrait-outline',
    description: 'Build native mobile apps',
    courses: ['React Native', 'Flutter', 'iOS', 'Android'],
    color: '#f59e0b',
  },
];

const features = [
  {
    id: 1,
    title: 'AI-Enhanced Learning',
    description: 'Personalized learning paths adapted to your progress',
    icon: 'analytics-outline',
  },
  {
    id: 2,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals',
    icon: 'people-outline',
  },
  {
    id: 3,
    title: 'Hands-on Projects',
    description: 'Build real-world applications',
    icon: 'construct-outline',
  },
];

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Master Tech Skills</Text>
        <Text style={styles.heroSubtitle}>
          Learn programming, AI, and more with our interactive courses
        </Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Learning Now</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Course Categories */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Our Course Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {courseCategories.map(category => (
            <View key={category.id} style={[styles.categoryCard, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon as any} size={40} color="#fff" />
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
              <View style={styles.coursesContainer}>
                {category.courses.map((course, index) => (
                  <View key={index} style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{course}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Features Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Why Choose Us</Text>
        {features.map(feature => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon as any} size={30} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Developed by Vivek</Text>
        <Text style={styles.footerSubText}>Empowering through technology</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryCard: {
    width: width * 0.7,
    padding: 20,
    borderRadius: 20,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 15,
  },
  coursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 5,
  },
  courseTagText: {
    color: '#fff',
    fontSize: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.62,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: 'bold',
  },
  footerSubText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
});
