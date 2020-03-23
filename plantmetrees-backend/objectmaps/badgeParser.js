function supporter(progress) {
    switch (true) {
        case (progress == 0):
            return '-';
        case (progress < 10):
            return 'Green Communier';
        case (progress < 50):
            return 'Supporter Grade I';
        case (progress < 100):
            return 'Supporter Grade II';
        case (progress < 500):
            return 'Supporter Grade III';
        case (progress < 1000):
            return 'Supporter Grade IV';
        case (progress < 5000):
            return 'Supporter Grade V';
        case (progress >= 5000):
            return 'Supporter Tribune';
    }
}

function organizer(progress) {
    switch (true) {
        case (progress >= 0 && progress < 500):
            return 'Green Aficionado';
        case (progress < 1000):
            return 'Organizer Grade I';
        case (progress < 5000):
            return 'Organizer Grade II';
        case (progress < 10000):
            return 'Organizer Grade III';
        case (progress < 20000):
            return 'Organizer Grade IV';
        case (progress < 50000):
            return 'Organizer Grade V';
        case (progress > 50000):
            return 'Organizer Palatine';  
    }
}

function community(progress) {
    switch (true) {
        case (progress == 0):
            return '-';
        case (progress < 10):
            return 'Inviter';
        case (progress < 50):
            return 'Inviter Grade I';
        case (progress < 100):
            return 'Inviter Grade II';
        case (progress < 250):
            return 'Inviter Grade III';
        case (progress < 500):
            return 'Inviter Grade IV';
        case (progress > 500):
            return 'Platform host';
    }
}

module.exports = {
    displayName: {
        supporter,
        organizer,
        community
    },
    progressPrefix: {
        supporter: 'Total value of items purchased',
        organizer: 'Total number trees planted from campaigns',
        community: 'Total number of invited people that joined the platfrom'
    }
}