//Getting DOM elements

const btnSelectImage = document.querySelector('.btn-select-image')
const btnSaveImage = document.querySelector('.btn-save-image')
const btnCropImage = document.querySelector('.btn-crop-image')
const btnClearCanvas = document.querySelector('.btn-clear-canvas')

const inputImagePicker = document.getElementById('input-image-picker')
const imagePreview = document.getElementById('img-image-preview')
const selection = document.getElementById('selection-tool')
const noImage = document.getElementById('no-image')



//Global scope variables

let startX
let startY
let relativeStartX
let relativeStartY
let endX
let endY
let relativeEndX
let relativeEndY

let startSelection = false
let isImageSelected = false

let image

let imageName

//Events and EventListeners

window.addEventListener('DOMContentLoaded', () => {
    inputImagePicker.addEventListener('change', () => { 
        //get the file
        let file = inputImagePicker.files[0]
        imageName = file.name
        //read the file
        let reader = new FileReader()
        reader.readAsDataURL(file)
        //get's the event of loading the image to the reader and makes it the src of the img on the DOM
        reader.onload = (event) => {
            image = new Image()
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
    if (!isImageSelected) {
        noImage.style.display = 'flex'
    } else {
        noImage.style.display = 'none'
    }
})

btnSelectImage.onclick = () => { inputImagePicker.click() }

const events = {
    mouseover() {
        this.style.cursor = 'crosshair'
    },
    mousedown() {
        const { clientX, clientY, offsetX, offsetY } = event
        // console.table({
        //     'client': [clientX, clientY],
        //     'offset': [offsetX, offsetY]
        // })

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true
    },
    mousemove() {
        endX = event.clientX
        endY = event.clientY

        if (startSelection) {

            selection.style.display = 'initial'
            selection.style.top = startY + 'px'
            selection.style.left = startX + 'px'

            /**
             * @todo Make the selection tool go sideways depending on the direction the user goes with the mouse
             */

            if(endX < startX || endY < startY) {
                console.log("negative values")
                selection.style.width = "-" + (startX - endX) + 'px'
                selection.style.height = "-" + (startY - endY) + 'px'
            }

            selection.style.width = (endX - startX) + 'px'
            selection.style.height = (endY - startY) + 'px'
        }
    },
    mouseup() {
        startSelection = false
        relativeEndX = event.layerX
        relativeEndY = event.layerY

        //show the crop button
        btnCropImage.style.display = 'flex'
    }
}

Object.keys(events).forEach(key => {
    imagePreview.addEventListener(key, events[key])
})

//Canvas

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

const onLoadImage = () => {
    canvas.width = image.width
    canvas.height = image.height

    //clear the context
    ctx.clearRect(0, 0, image.width, image.height)

    //draw the image on the context
    ctx.drawImage(image, 0, 0)


    noImage.style.display = 'none'
    imagePreview.style.display = 'initial'
    imagePreview.src = canvas.toDataURL()

    //set the image non existence flag to false
}

btnCropImage.onclick = () => {
    const { width: imgW, height: imgH } = image
    const { width: prevW, height: prevH } = imagePreview

    
    const [ widthFactor, heightFactor ] = [ 
        +(imgW / prevW), 
        +(imgH / prevH)
    ]

    const [ selectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight ] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +( relativeStartX * widthFactor ),
        +( relativeStartY * heightFactor )
    ]

    //get the cropped image from the canvas context
    const croppedImage = ctx.getImageData( 
        actualX, 
        actualY, 
        croppedWidth, 
        croppedHeight
    ) 

    //delete canvas context
    ctx.clearRect(0, 0, ctx.width, ctx.height)

    //ajust propotions to the new image
    image.width = canvas.width = croppedWidth
    image.height = canvas.height = croppedHeight

    //add the cropped image to the context
    ctx.putImageData(croppedImage, 0, 0)

    //hide the selection tool
    selection.style.display = 'none'

    //update the imagePreview
    imagePreview.src = canvas.toDataURL()

    //show save image button
    btnClearCanvas.style.display = 'flex'
    btnSaveImage.style.display = 'flex'
    btnCropImage.style.display = 'none'

}

//download button
btnSaveImage.onclick = () => {
    const a = document.createElement('a')
    a.download = imageName + '-cropped.png'
    a.href = canvas.toDataURL()
    a.click()
}

btnClearCanvas.onclick = () => {
    //clear the context and erase the image selected
    ctx.clearRect(0, 0, ctx.width, ctx.height)
    selection.style.display = 'none'
    imagePreview.src = ''

    //remove all the elements needed
    imagePreview.style.display = 'none'
    btnClearCanvas.style.display = 'none'
    btnCropImage.style.display = 'none'
    btnSaveImage.style.display = 'none'

    //turn on the no image warning
    noImage.style.display = "flex"
}



