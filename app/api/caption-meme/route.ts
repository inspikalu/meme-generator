// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(request: NextRequest) {
//     try {
//         const data = await request.json(); // Parse the request body
//         console.log(data);
//         const { text0, text1, text2, text3, selectedMemeId } = data;

//         // Create URLSearchParams for the body
//         const queryParams = new URLSearchParams({
//             text0: text0,
//             text1: text1,
//             text2: text2,
//             text3: text3,
//             username: 'pronstarrer',
//             password: 'pronstarrer@gmail.com',
//             template_id: selectedMemeId
//         }).toString();

//         // POST request with form-urlencoded data
//         const sendCaptionImage = await fetch('https://api.imgflip.com/caption_image', {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded"
//             },
//             body: queryParams
//         });

//         const jsonResponse = await sendCaptionImage.json();
//         console.log(jsonResponse);

//         return NextResponse.json({ newImage: jsonResponse.data }, { status: 200 });
//     } catch (error: any) {
//         console.error(error);
//         return NextResponse.json({ message: 'An error occurred', error: error?.message }, { status: 500 });
//     }
// }

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log(data);

        const { text0, text1, text2, text3, selectedMemeId } = data;


        const boxes = [
            {
                text: text0 || '',
            },
            {
                text: text1 || '',
            }
        ];

        if (text2) {
            boxes.push({
                text: text2,
            });
        }

        if (text3) {
            boxes.push({
                text: text3
            });
        }


        const queryParams = new URLSearchParams({
            template_id: selectedMemeId,
            username: 'pronstarrer',
            password: 'pronstarrer@gmail.com',
        });

        // Append each box individually to the URLSearchParams
        boxes.forEach((box, index) => {
            queryParams.append(`boxes[${index}][text]`, box.text);
        });

        // POST request with form-urlencoded data
        const sendCaptionImage = await fetch('https://api.imgflip.com/caption_image', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: queryParams.toString()
        });

        const jsonResponse = await sendCaptionImage.json();
        console.log(jsonResponse);

        return NextResponse.json({ newImage: jsonResponse.data }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: 'An error occurred', error: error?.message }, { status: 500 });
    }
}

