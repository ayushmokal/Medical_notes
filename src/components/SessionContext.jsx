import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SessionContext = ({ patientId }) => {
    const defaultContext = {
        scores: { sleep: 78, recovery: 85, activity: 60 },
        recentLabs: [
            { name: 'Lipid Panel', status: 'Normal', date: 'Nov 20' },
            { name: 'HbA1c', status: 'Elevated', date: 'Oct 15' }
        ],
        coachSummary: "Patient has been improving sleep consistency."
    };

    const [contextData, setContextData] = useState(defaultContext);

    useEffect(() => {
        const fetchContext = async () => {
            if (!patientId) return;
            try {
                const patientRef = doc(db, 'patients', patientId);
                const snap = await getDoc(patientRef);
                if (!snap.exists()) return;

                const data = snap.data();
                const health = data?.healthContext || {};

                setContextData({
                    scores: health.scores || defaultContext.scores,
                    recentLabs: health.recentLabs || defaultContext.recentLabs,
                    coachSummary: health.coachSummary || defaultContext.coachSummary
                });
            } catch (err) {
                console.error('Failed to load health context for patient:', err);
            }
        };

        fetchContext();
        // We only want to refetch when patientId changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    return (
        <div className="bg-white border-l border-gray-200 w-80 flex-shrink-0 p-4 overflow-y-auto h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Health Context</h3>

            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Today's Scores</h4>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{contextData.scores.sleep}</div>
                        <div className="text-xs text-gray-500">Sleep</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{contextData.scores.recovery}</div>
                        <div className="text-xs text-gray-500">Recov</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">{contextData.scores.activity}</div>
                        <div className="text-xs text-gray-500">Activ</div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Labs</h4>
                <div className="space-y-2">
                    {contextData.recentLabs.map((lab, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <div>
                                <span className="font-medium text-gray-900">{lab.name}</span>
                                <span className="text-gray-500 text-xs ml-2">{lab.date}</span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${lab.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {lab.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Coach Note</h4>
                <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-900">
                    {contextData.coachSummary}
                </div>
            </div>
        </div>
    );
};

export default SessionContext;
