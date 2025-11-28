let AppleHealthKit = require('react-native-health').default;
if (!AppleHealthKit) {
    AppleHealthKit = require('react-native-health');
}





const permissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.HeartRateVariability,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
            AppleHealthKit.Constants.Permissions.RestingHeartRate,
        ],
    },
};

export const initHealthKit = () => {
    return new Promise((resolve, reject) => {
        AppleHealthKit.initHealthKit(permissions, (error) => {
            if (error) {
                console.log('[ERROR] Cannot grant permissions!', error);
                reject(error);
                return;
            }
            resolve(true);
        });
    });
};

export const getStepCount = (date = new Date()) => {
    return new Promise((resolve, reject) => {
        const options = {
            date: date.toISOString(),
        };

        AppleHealthKit.getStepCount(options, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results.value);
        });
    });
};

export const getSleepSamples = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const options = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        AppleHealthKit.getSleepSamples(options, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

export const getHeartRateVariability = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const options = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        AppleHealthKit.getHeartRateVariabilitySamples(options, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};

export const getActiveEnergyBurned = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const options = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};
