import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';
import { toast } from 'react-toastify';
import EnrollmentStatus from '../../components/student/EnrollmentStatus';
import Loading from '../../components/student/Loading';

const MyEnrollments = () => {
    const { 
        userData, 
        enrolledCourses, 
        fetchUserEnrolledCourses, 
        navigate, 
        backendUrl, 
        getToken, 
        calculateCourseDuration, 
        calculateNoOfLectures 
    } = useContext(AppContext);

    const [progressArray, setProgressData] = useState([]);
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to get course progress for approved courses
    const getCourseProgress = async () => {
        try {
            const token = await getToken();

            // Use Promise.all to handle multiple async operations
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    const { data } = await axios.post(
                        `${backendUrl}/api/user/get-course-progress`,
                        { courseId: course._id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Calculate total lectures
                    let totalLectures = calculateNoOfLectures(course);
                    const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                    
                    return { 
                        totalLectures, 
                        lectureCompleted,
                        percentComplete: totalLectures > 0 ? (lectureCompleted / totalLectures) * 100 : 0 
                    };
                })
            );

            setProgressData(tempProgressArray);
        } catch (error) {
            console.error('Error fetching course progress:', error);
            toast.error('Failed to load course progress');
        }
    };

    // Function to fetch pending enrollment requests
    const fetchPendingEnrollments = async () => {
        try {
            const token = await getToken();
            
            const { data } = await axios.get(
                `${backendUrl}/api/user/pending-enrollments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                setPendingEnrollments(data.pendingEnrollments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching pending enrollments:', error);
            toast.error('Failed to load pending enrollments');
        }
    };

    // Load data when component mounts
    useEffect(() => {
        if (userData) {
            setIsLoading(true);
            Promise.all([
                fetchUserEnrolledCourses(),
                fetchPendingEnrollments()
            ])
            .finally(() => setIsLoading(false));
        }
    }, [userData]);

    // Calculate progress when enrolled courses change
    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseProgress();
        }
    }, [enrolledCourses]);

    if (isLoading) return <Loading />;

    return (
        <>
            <div className='md:px-36 px-8 pt-10 pb-20'>
                <h1 className='text-2xl font-semibold mb-8'>My Learning</h1>

                {/* Pending Enrollments Section */}
                {pendingEnrollments.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-medium mb-4">Pending Enrollments</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <p className="text-yellow-700">
                                These course enrollments are waiting for admin approval. You'll receive access once approved.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingEnrollments.map((enrollment) => (
                                <div key={enrollment._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <img 
                                        src={enrollment.course.courseThumbnail} 
                                        alt={enrollment.course.courseTitle} 
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg mb-1 text-gray-800">{enrollment.course.courseTitle}</h3>
                                        <p className="text-gray-500 text-sm mb-3">By {enrollment.course.educator.name}</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <EnrollmentStatus status="pending" />
                                            <span className="text-gray-500 text-xs">
                                                {new Date(enrollment.requestDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved Enrollments Section */}
                <h2 className="text-xl font-medium mb-4">My Courses</h2>
                
                {enrolledCourses.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                        <p className="text-gray-500 mb-4">You don't have any approved course enrollments yet.</p>
                        <button 
                            onClick={() => navigate('/course-list')} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
                        {enrolledCourses.map((course, index) => (
                            <div 
                                key={course._id} 
                                className={`p-4 ${index !== enrolledCourses.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50`}
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Course Thumbnail */}
                                    <img 
                                        src={course.courseThumbnail} 
                                        alt={course.courseTitle} 
                                        className="w-full md:w-48 h-32 object-cover rounded"
                                    />
                                    
                                    {/* Course Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                            <h3 className="font-medium text-lg text-gray-800">{course.courseTitle}</h3>
                                            
                                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                {progressArray[index] && progressArray[index].percentComplete === 100 ? (
                                                    <EnrollmentStatus status="completed" />
                                                ) : (
                                                    <EnrollmentStatus status="inProgress" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-500 text-sm">By {course.educator.name}</p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-500">
                                                    {progressArray[index] ? 
                                                        `${progressArray[index].lectureCompleted} of ${progressArray[index].totalLectures} lectures completed` : 
                                                        'Loading progress...'}
                                                </span>
                                                <span className="font-medium">
                                                    {progressArray[index] ? 
                                                        `${Math.round(progressArray[index].percentComplete)}%` : 
                                                        '0%'}
                                                </span>
                                            </div>
                                            <Line 
                                                className="bg-gray-200 rounded-full h-2" 
                                                strokeWidth={4} 
                                                strokeColor="#3b82f6" 
                                                trailWidth={4}
                                                percent={progressArray[index] ? progressArray[index].percentComplete : 0} 
                                            />
                                        </div>
                                        
                                        {/* Course Details */}
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{calculateCourseDuration(course)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>{calculateNoOfLectures(course)} lectures</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => navigate(`/player/${course._id}`)} 
                                                className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                            >
                                                {progressArray[index] && progressArray[index].percentComplete > 0 ? 'Continue Learning' : 'Start Course'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyEnrollments;