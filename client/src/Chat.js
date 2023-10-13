import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Replace with your server URL

function Chat() 
{
    const [showjoinForm, setShowJoinForm] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => 
    {
        socket.on('receive_message', (data) => 
        {
            setMessages([...messages, data.data]);
        });
    }, [messages]);


    const handleCreateRoom = (e) =>
    {
        e.preventDefault();
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
		let uniqueRoomId = '';
	  
		for (let i = 0; i < 9; i++) 
		{
		  	const randomIndex = Math.floor(Math.random() * characters.length);
		  	if (i==3 || i==6)
		  	{
		  		uniqueRoomId = uniqueRoomId + '-';
		  	}
		  	uniqueRoomId = uniqueRoomId + characters[randomIndex];
		}
		socket.emit('create_room', uniqueRoomId);
        setRoomId(uniqueRoomId);
		console.log(uniqueRoomId);
        setShowCreateForm(false);
    }

    const handleJoinRoom = (e) =>
    {
        e.preventDefault();
        socket.emit('join_room', { roomId});
        setShowJoinForm(false);
    }

    const handleSendMessage = (e) => 
    {
        e.preventDefault();
        socket.emit('send_message', { roomId, message });
        setMessage('');
    };

    useEffect(() =>
    {
        socket.on('receive_message', async (data) => 
		{
			console.log("received message", data);
			setMessages((messages) => [...messages, data.data]);
		});
    },[socket]);

    return (
        <div className='chat_parent'>
            <div>
                <button type='submit' onClick={()=> {setShowCreateForm(true); setShowJoinForm(false)}}>Create Room</button>
                <button type='submit' onClick={()=> {setShowJoinForm(true); setShowCreateForm(false)}}>Join Room</button>
            </div>
            {showCreateForm && (
                <form onSubmit={handleCreateRoom}>
                    <input
                        type='text'
                        autoComplete="off"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder='Enter Room Name'
                        required
                    />
                    <button type='submit'>Create</button>
                </form>
            )}
            {showjoinForm && (
                <form onSubmit={handleJoinRoom}>
                    <input
                        type='text'
                        autoComplete="off"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder='Enter Room Id'
                        required
                    />
                    <button type='submit'>Join</button>
                </form>
            )}

            {roomId && <div className='chat_container'>
                {messages.map((message, index) => 
                {
                    return (
                        <div key={index} className='message'>
                            <p>{message.message}</p>
                            <span>{message.user}</span>
                        </div>
                    );
                })}
                <form onSubmit={handleSendMessage}>
                    <input
                        type='text'
                        autoComplete="off"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Enter message'
                    />
                    <button type='submit'>Send</button>
                </form>
            </div>}

        </div>
    );
}

export default Chat;
