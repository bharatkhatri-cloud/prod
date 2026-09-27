import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SPRING_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';

const SETTING_LABELS = {
    MOULD_FILLING_BAG_CHECK: {
        label: 'Mould Filling (Bag Check)',
        description:
            'When ON, the scanned Bag ID must exist in Bag Inoculation records before moulds can be filled. Turn OFF to allow filling moulds with any Bag ID without a previous record.',
    },
    HUMIDIFIER_MOULD_FILLING_CHECK: {
        label: 'Humidifier (Mould Check)',
        description:
            'When ON, scanned mould IDs must exist in Mould Filling records before they can be placed in the Humidifier. Turn OFF to allow placing any mould ID directly into the Humidifier.',
    },
    OVEN_IN_HUMIDIFIER_CHECK: {
        label: 'Oven In (In Humidifier SMFG Check)',
        description:
            'When ON, pieces must exist in the Humidifier (SMFG records) before they can be placed in an oven. Turn OFF to allow placing any piece directly into the oven without a humidifier record.',
    },
};

export default function AdminSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${SPRING_HOST}api/v2s/settings`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            toast.error('Could not load settings: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggle = async (settingKey, currentEnabled) => {
        setToggling((prev) => ({ ...prev, [settingKey]: true }));
        try {
            const res = await fetch(`${SPRING_HOST}api/v2s/settings/${settingKey}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ enabled: !currentEnabled }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Update failed');
            }
            const updated = await res.json();
            setSettings((prev) =>
                prev.map((s) => (s.settingKey === settingKey ? updated : s))
            );
            toast.success(`"${updated.label}" turned ${updated.enabled ? 'ON' : 'OFF'}`);
        } catch (err) {
            toast.error('Failed to update setting: ' + err.message);
        } finally {
            setToggling((prev) => ({ ...prev, [settingKey]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <div className="max-w-2xl mx-auto">
                
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Validation Settings</h1>
                <p className="text-sm text-gray-400 mb-8">
                    Toggle process validations on or off. Changes take effect immediately.
                </p>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : settings.length === 0 ? (
                    <p className="text-gray-400 text-sm">No settings found.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {settings.map((setting) => {
                            const meta = SETTING_LABELS[setting.settingKey] || {};
                            const isToggling = !!toggling[setting.settingKey];

                            return (
                                <div
                                    key={setting.settingKey}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-5"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {meta.label || setting.label || setting.settingKey}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            {meta.description || setting.description || ''}
                                        </p>
                                        <span
                                            className={`inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                                setting.enabled
                                                    ? 'bg-green-50 text-green-600 border-green-200'
                                                    : 'bg-red-50 text-red-500 border-red-200'
                                            }`}
                                        >
                                            {setting.enabled ? 'ON' : 'OFF'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => toggle(setting.settingKey, setting.enabled)}
                                        disabled={isToggling}
                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none mt-1 ${
                                            setting.enabled ? 'bg-teal-500' : 'bg-gray-200'
                                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        title={setting.enabled ? 'Click to disable' : 'Click to enable'}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                                setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
