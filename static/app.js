
window.addEventListener('scroll', () => {
  var scrollPosition = window.scrollY;
  var opacityValue = 1 - (scrollPosition / (window.innerHeight / 2.9));
  var fontSizeValue = 14 + (scrollPosition / 100);
  
  document.querySelector('.main-heading').style.opacity = opacityValue;
  document.querySelector('.main-heading').style.fontSize = fontSizeValue + 'px';
})

window.addEventListener('scroll', function () {
  var scrollTop = window.scrollY;
  var leftCard = document.getElementById('leftCard');
  var rightCard = document.getElementById('rightCard');
  var windowHeight = window.innerHeight;

  leftCard.style.left = (-730 + (scrollTop / windowHeight) * 400) + 'px';
  leftCard.style.opacity = (scrollTop / windowHeight);

  rightCard.style.right = (-730 + (scrollTop / windowHeight) * 400) + 'px';
  rightCard.style.opacity = (scrollTop / windowHeight);
});

let input = document.getElementById('textInput');
let fileInput = document.getElementById('fileInput');
let deleteButton = document.getElementById('delete');
let testButton = document.getElementById('test');

let percentage = document.getElementById('percentage');
let progressBar = document.getElementById("progress-bar");
let Ai_cnt = document.getElementById('Ai_cnt');
let Hmn_cnt = document.getElementById('Hmn_cnt');
let textData = input.value.trim();

deleteButton.addEventListener('click', () => {
  input.value = '';
  fileInput.value = '';
  percentage.innerText = '0%';
  progressBar.style.width = '0';
  percentage.style.color = 'white';
  Ai_cnt.innerText='0';
  Hmn_cnt.innerText='0';
})

testButton.addEventListener('click', () => {
  input.classList.add('input_transparent');
  input.disabled = true;
  percentage.innerText = '0%';
  percentage.style.color = 'white';
  let textData = input.value.trim();
  progressBar.style.width = '0';
  
  Ai_cnt.innerText='0';
  Hmn_cnt.innerText='0';
  
  if (textData === '') { 
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function(event) {
        const fileContent = event.target.result;
        // Convert the PDF content to plain text
        convertPDFToText(fileContent)
          .then(textData => {
            
            console.log(textData);
            predictText(textData);
          })
          .catch(error => {
            console.error('Error converting PDF to text:', error);
          });
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.error('No file uploaded.');
    }
  } else {
    predictText(textData);
  }
});

function convertPDFToText(pdfContent) {
  return new Promise((resolve, reject) => {
    // Load PDF.js library
    pdfjsLib.getDocument(pdfContent).promise.then(function(pdf) {
      // Initialize variables to store text content
      let text = '';
      const numPages = pdf.numPages;

      // Loop through each page of the PDF
      for (let i = 1; i <= numPages; i++) {
        pdf.getPage(i).then(function(page) {
          // Extract text content from each page
          page.getTextContent().then(function(content) {
            content.items.forEach(function(item) {
              text += item.str + ' ';
            });
            // Resolve the promise with the extracted text
            resolve(text);
          });
        });
      }
    }, reject);
  });
}

function predictText(textData) {
  fetch('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: textData
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Update UI based on server response
    let aiPercentage = data.aiPercentage;
    animateProgressBar(aiPercentage, 2000);
    percentage.innerText = aiPercentage.toFixed(2) + '%';
    if (aiPercentage > 60) {
      percentage.style.color = '#E72929';
    }
    else{
      percentage.style.color = 'green';
    }
    Ai_cnt.innerText = aiPercentage.toFixed(2);
    Hmn_cnt.innerText = (100 - aiPercentage).toFixed(2);
    input.disabled = false;
    input.classList.remove('input_transparent');
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle error
  });
}

function updateProgressBar(progress) {
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = `${progress}%`;
}

function animateProgressBar(targetProgress, duration) {
  const progressBar = document.getElementById("progress-bar");
  let currentProgress = parseInt(progressBar.style.width) || 0;
  const increment = (targetProgress - currentProgress) / (duration / 10);

  const intervalId = setInterval(function () {
    currentProgress += increment;
    updateProgressBar(currentProgress);
    if (currentProgress >= targetProgress) {
      clearInterval(intervalId);
    }
  }, 10);
}
  