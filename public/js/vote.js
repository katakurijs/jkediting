// Voting data
const categories = [
    {
        title: "Realest viewer",
        description: "Who keeps it 100? The viewer who's always authentic and genuine with everyone."
    },
    {
        title: "Funniest viewer",
        description: "The comedy king/queen of chat. Always making everyone laugh with perfect timing."
    },
    {
        title: "Most aura viewer",
        description: "Unmatched presence and energy. The viewer with that special something that commands respect."
    },
    {
        title: "Smartest viewer",
        description: "The brain of the community. Always dropping knowledge and intelligent takes."
    },
    {
        title: "Kindest viewer",
        description: "The heart of the community. Always spreading positivity and helping others."
    },
    {
        title: "Richest viewer",
        description: "Big spender energy. Supporting the stream with the most generous donations and subs."
    },
    {
        title: "The best viewer",
        description: "The ultimate MVP. The complete package who embodies all the best qualities."
    }
];

const viewers = [
    "Tomfoolerery",
    "thomasvanwinkle",
    "ARD_Sr",
    "v3rt1cal",
    "kata6999",
    "laviluvcheerios",
    "izaan_bad",
    "m3rcury003",
    "just_albania67",
    "jaden",
    "niles",
    "miles",
    "cosmic",
    "bigbootybrobouncer",
    "hifi_darkrose"
];

let currentCategoryIndex = 0;
let userVotes = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start voting immediately
    loadCategory(0);
    updateProgress();
    fetchTotalVotes();
});

// Load category
function loadCategory(index) {
    const category = categories[index];
    const voteContent = document.getElementById('voteContent');
    
    voteContent.style.opacity = '0';
    voteContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        voteContent.innerHTML = `
            <div class="category-header">
                <h2 class="category-title">${category.title}</h2>
                <p class="category-description">${category.description}</p>
            </div>
            <div class="viewers-grid">
                ${viewers.map(viewer => `
                    <div class="viewer-card" onclick="selectViewer('${viewer}')">
                        <div class="viewer-avatar">
                            ${getInitials(viewer)}
                        </div>
                        <div class="viewer-name">${viewer}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        voteContent.style.opacity = '1';
        voteContent.style.transform = 'translateY(0)';
    }, 300);
    
    updateStepIndicators();
}

// Get initials for avatar
function getInitials(name) {
    const words = name.split(/[_\s]+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Select viewer (store vote temporarily)
function selectViewer(viewer) {
    const category = categories[currentCategoryIndex].title;
    userVotes[category] = viewer;
    
    // Visual feedback
    const cards = document.querySelectorAll('.viewer-card');
    cards.forEach(card => {
        if (card.querySelector('.viewer-name').textContent === viewer) {
            card.style.borderColor = 'var(--success)';
            card.style.background = 'rgba(16, 185, 129, 0.1)';
            
            setTimeout(() => {
                card.style.borderColor = '';
                card.style.background = '';
            }, 500);
        }
    });
    
    // Move to next category
    setTimeout(() => {
        nextCategory();
    }, 600);
}

// Next category
function nextCategory() {
    // Mark current step as completed
    const currentStep = document.querySelector(`.step[data-step="${currentCategoryIndex}"]`);
    if (currentStep) {
        currentStep.classList.remove('active');
        currentStep.classList.add('completed');
    }
    
    currentCategoryIndex++;
    
    if (currentCategoryIndex < categories.length) {
        loadCategory(currentCategoryIndex);
        updateProgress();
    } else {
        showReviewScreen();
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentCategoryIndex) / categories.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Update step indicators
function updateStepIndicators() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === currentCategoryIndex) {
            step.classList.add('active');
        }
    });
}

// Show review screen
function showReviewScreen() {
    document.getElementById('votingInterface').style.display = 'none';
    document.getElementById('reviewScreen').style.display = 'block';
    
    // Display votes summary
    const votesSummary = document.getElementById('votesSummary');
    votesSummary.innerHTML = Object.entries(userVotes).map(([category, choice]) => `
        <div class="vote-item">
            <div class="vote-category">${category}</div>
            <div class="vote-choice">${choice}</div>
        </div>
    `).join('');
    
    // Focus on name input and add enter key listener
    setTimeout(() => {
        const nameInput = document.getElementById('voterName');
        if (nameInput) {
            nameInput.focus();
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitAllVotes();
                }
            });
        }
    }, 100);
}

// Go back to voting (edit votes)
function goBackToVoting() {
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('votingInterface').style.display = 'block';
    
    // Reset to first category
    currentCategoryIndex = 0;
    userVotes = {};
    
    // Reset all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('completed');
    });
    
    loadCategory(0);
    updateProgress();
}

// Submit all votes
async function submitAllVotes() {
    // Get voter name
    const nameInput = document.getElementById('voterName');
    const voterName = nameInput.value.trim();
    
    if (!voterName) {
        nameInput.style.borderColor = '#ef4444';
        nameInput.placeholder = 'Please enter your name';
        nameInput.focus();
        setTimeout(() => {
            nameInput.style.borderColor = '';
            nameInput.placeholder = 'Enter your name...';
        }, 2000);
        return;
    }
    
    try {
        // Submit each vote to the server
        for (const [category, viewer] of Object.entries(userVotes)) {
            await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: category,
                    viewer: viewer
                })
            });
        }
        
        // Show success screen
        showSuccessScreen();
        
    } catch (error) {
        console.error('Error submitting votes:', error);
        alert('There was an error submitting your votes. Please try again.');
    }
}

// Show success screen
async function showSuccessScreen() {
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('successScreen').style.display = 'flex';
    
    // Fetch and display total participants
    try {
        const response = await fetch('/api/votes');
        const data = await response.json();
        
        let totalVotes = 0;
        Object.values(data).forEach(category => {
            Object.values(category).forEach(count => {
                totalVotes += count;
            });
        });
        
        // Estimate participants (assuming 7 votes per person)
        const estimatedParticipants = Math.ceil(totalVotes / 7);
        
        animateNumber('totalParticipants', estimatedParticipants, 1500);
    } catch (error) {
        console.error('Error fetching votes:', error);
    }
}

// Vote again
function voteAgain() {
    // Reset everything
    document.getElementById('successScreen').style.display = 'none';
    document.getElementById('votingInterface').style.display = 'block';
    
    currentCategoryIndex = 0;
    userVotes = {};
    
    // Reset all steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('completed', 'active');
        if (index === 0) {
            step.classList.add('active');
        }
    });
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '0%';
    
    // Start voting from beginning
    loadCategory(0);
    updateProgress();
}

// Animate number counting
function animateNumber(elementId, finalValue, duration) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const increment = finalValue / (duration / 16);
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 16);
}

// Fetch total votes for display
async function fetchTotalVotes() {
    try {
        const response = await fetch('/api/votes');
        const data = await response.json();
        
        let totalVotes = 0;
        Object.values(data).forEach(category => {
            Object.values(category).forEach(count => {
                totalVotes += count;
            });
        });
        
        const totalVotesElement = document.getElementById('totalVotes');
        if (totalVotesElement) {
            totalVotesElement.textContent = totalVotes;
        }
    } catch (error) {
        console.error('Error fetching votes:', error);
    }
}

// Add smooth transitions
document.addEventListener('DOMContentLoaded', () => {
    const voteContent = document.getElementById('voteContent');
    if (voteContent) {
        voteContent.style.transition = 'all 0.3s ease';
    }
});