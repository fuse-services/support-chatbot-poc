
const dropArea = document.getElementById("drop-area");
const dropAreaXsn = document.getElementById("drop-area-xsn");

 // Trigger file input click when the drop area is clicked
dropArea.addEventListener("click", function () {
    console.log('inside click event');
    document.getElementById("screenshot-input").click();
});

 // Trigger file input click when the drop area is clicked
 dropAreaXsn.addEventListener("click", function () {
    console.log('inside xsn click event');
    document.getElementById("xsn-file-input").click();
});

// Handle selected file when the file input changes
document.getElementById("screenshot-input").addEventListener("change", function (e) {
    const selectedFiles = e.target.files;

    if(Array.from(selectedFiles).length > 0) {
        const filetext = document.getElementById('screenshot-name');
        const filetextSpan = document.getElementById('screenshot-name-span');
    
        filetext.textContent = "";
        filetextSpan.textContent = "";
    }

    Array.from(selectedFiles).forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name}`);
      handleImageFile(file, index+1);
    });
});

// Handle selected file when the file input changes
document.getElementById("xsn-file-input").addEventListener("change", function (e) {
    const selectedFile = e.target.files[0];
    if(selectedFile) {
        console.log(`XSN File : ${selectedFile.name}`);
        handleXsnFile(selectedFile);
    }

});

function handleImageFile(file, i) {
    
    const filetextSpan = document.getElementById('screenshot-name-span');
    if (filetextSpan) {
        console.log(filetextSpan);
        filetextSpan.textContent = filetextSpan.textContent == "" ? `${i}. ${file.name}  ` : filetextSpan.textContent + `${i}. ${file.name}  `;
    }

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
    
        reader.onload = function () {
            const thumbnailContainer = document.getElementById('screenshot-name');
        
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = reader.result;
            thumbnailImg.alt = file.name;
            thumbnailImg.style.width = "150px";
            thumbnailImg.style.height = "150px";
            thumbnailContainer.appendChild(thumbnailImg);
        };
    
        reader.readAsDataURL(file);
      }

}

function handleXsnFile(file) {
    const filetextSpan = document.getElementById('xsn-file-span');
    if (filetextSpan) {
        console.log(filetextSpan);
        filetextSpan.textContent = file.name;
    }

    const fileName = document.getElementById('xsn-file-name');
    if (fileName) {
        console.log(fileName);
        fileName.textContent = "";
        fileName.innerHTML = `<i class='bi bi-paperclip'></i> ${file.name}`;
    }
}
