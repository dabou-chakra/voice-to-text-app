import React, { useState } from 'react';
import axios from 'axios';

const TranscriptionAndRecipeTransformation = () => {
    console.log(process.env);
    const auth_token = process.env.REACT_APP_OPENAI_API_KEY;
    const [file, setFile] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [recipe, setRecipe] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTranscription = async () => {
        if (!file) {
            setError('No file selected.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-1');

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${auth_token}`
            }
        };

        setLoading(true);
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                config
            );
            // console.log(response.data.text);
            const arabicTranscription = response.data.text;
            setTranscript(arabicTranscription);
            await translateAndTransform(arabicTranscription);
        } catch (error) {
            console.error('Error during transcription:', error);
            setError('Failed to transcribe audio.');
        } finally {
            setLoading(false);
        }
    };

    const translateAndTransform = async (arabicTranscription) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "Translate Arabic to English and convert to a cooking recipe."
                }, {
                    role: "user",
                    content: arabicTranscription
                }],
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${auth_token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Assuming the response to be in English and structured as a recipe
            setRecipe(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Error translating and transforming the transcription:', error);
            setError('Failed to translate and transform the transcription.');
        }
    };

    return (
        <div>
            <h1>Mama Joo3an</h1>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
            />
            <button onClick={handleTranscription} disabled={loading}>
                {loading ? 'Processing...' : 'Transcribe and Transform'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h2>Transcript:</h2>
                <p>{transcript || 'Your transcription will appear here...'}</p>
            </div>
            <div>
                <h2>Translated Recipe:</h2>
                <p>{recipe || 'Your translated recipe will appear here...'}</p>
            </div>
        </div>
    );
};

export default TranscriptionAndRecipeTransformation;
