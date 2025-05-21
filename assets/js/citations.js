document.addEventListener('DOMContentLoaded', function() {
    // 获取所有带有citation-count类的元素
    const citationElements = document.querySelectorAll('.citation-count');
    
    // 为每个元素获取引用数
    citationElements.forEach(element => {
        const paperId = element.getAttribute('data-paper-id');
        if (paperId) {
            fetchCitationCount(paperId, element);
        }
    });
});

async function fetchCitationCount(paperId, element) {
    try {
        const response = await fetch(`https://api.semanticscholar.org/v1/paper/${paperId}`);
        const data = await response.json();
        
        if (data.citationCount !== undefined) {
            element.textContent = `(${data.citationCount})`;
        } else {
            element.textContent = '(0)';
        }
    } catch (error) {
        console.error('Error fetching citation count:', error);
        element.textContent = '(N/A)';
    }
} 