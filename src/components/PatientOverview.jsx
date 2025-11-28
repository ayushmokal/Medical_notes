import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const PatientOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock fetching patient data for now if not in DB
                // const patientDoc = await getDoc(doc(db, 'users', id));
                // if (patientDoc.exists()) {
                //   setPatient(patientDoc.data());
                // }

                setPatient({ name: 'John Doe', age: 35, condition: 'Hypertension' });
                setScores({ sleep: 78, recovery: 85, activity: 60 });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching patient data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-500 hover:text-gray-700 mb-2"
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{patient?.name}'s Overview</h1>
                        <p className="text-gray-600">Age: {patient?.age} • Condition: {patient?.condition}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Start Session
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sleep Score</h3>
                        <div className="text-4xl font-bold text-blue-600">{scores?.sleep}</div>
                        <p className="text-sm text-gray-500 mt-1">Avg 7h 12m</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Recovery</h3>
                        <div className="text-4xl font-bold text-green-600">{scores?.recovery}</div>
                        <p className="text-sm text-gray-500 mt-1">High HRV today</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Activity</h3>
                        <div className="text-4xl font-bold text-orange-600">{scores?.activity}</div>
                        <p className="text-sm text-gray-500 mt-1">4,500 steps</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Lab Results</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Lipid Panel</p>
                                    <p className="text-sm text-gray-500">Nov 20, 2025</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Normal</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">HbA1c</p>
                                    <p className="text-sm text-gray-500">Oct 15, 2025</p>
                                </div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Elevated</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Coach Insights</h2>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-blue-900 text-sm leading-relaxed">
                                "John's recovery has been trending upwards this week. He has been consistent with his sleep schedule, which correlates with the improved HRV. However, activity levels are slightly below target."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientOverview;
