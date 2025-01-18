import React, {useState, useEffect, useContext, useRef} from 'react';
import {IconButton, Box, Text} from '@chakra-ui/react'
import {ArrowUpIcon, ArrowDownIcon} from "@chakra-ui/icons";
import {UserContext} from "../userContext";

interface VoteWidgetProps {
  postId: string;
  onVote?: () => void;
}

enum VoteType {
  DownVote = -1,
  NoVote = 0,
  UpVote = 1
}

interface Vote {
  _id: string;
  postId: string;
  userId: string;
  type: VoteType;
}

interface VoteResult {
  newScore: number,
  vote: Vote
}

const magnitudes = ['', 'k', 'M', 'G', 'T']

const VoteWidget: React.FC<VoteWidgetProps> = ({
                                                 postId,
                                                 onVote,
                                               }) => {
  const [score, setScore] = useState(0);
  const [scoreText, setScoreText] = useState('0');
  const [vote, setVote] = useState<Vote | null>(null);
  const {user} = useContext(UserContext)

  // REST
  const handleRestError = (err: Error) => {
    console.warn(err);
  }

  const fetchPostScore = () => {
    fetch(`http://localhost:3000/post/${postId}?scoreOnly=true`).then((response) => {
      if (!response.ok) throw new Error('Could not fetch post score');

      return response.json();
    }).then((data) => {
      setScore(data.score);
    }).catch(handleRestError);
  }

  const fetchVoteState = () => {
    if (!postId || !user) {
      console.log("Cannot fetch vote state: user or post ID not set");
      return;
    }

    fetch(`http://localhost:3000/vote?postId=${postId}&userId=${user._id}`).then(
      (response) => {
        if (!response.ok) throw new Error("Could not fetch vote state");

        return response.json();
      }
    ).then((data) => {
      if (!data || data.length !== 1) setVote(null);
      else {
        setVote(data[0]);
      }
    }).catch(handleRestError)
  }

  const postVote = (type: VoteType) => {
    if (!postId || !user) {
      console.log("Cannot post vote: user or post ID not set");
      return;
    }

    if (type === VoteType.NoVote) return;

    fetch(`http://localhost:3000/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: postId,
        userId: user._id,
        type: type
      })
    }).then((response) => {
      if (!response.ok) throw new Error("Could not post vote");
      if (onVote) onVote();
      return response.json();
    }).then((data) => {
      setVote(data.vote);
      setScore(data.newScore)
    }).catch(handleRestError)
  }

  const putVote = (type: VoteType) => {
    if (!postId || !user) {
      console.log("Cannot post vote: user or post ID not set");
      return;
    }
    if (!vote) return;
    if (vote.type === type || type === VoteType.NoVote) return;

    fetch(`http://localhost:3000/vote/${vote._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({type: type})
    }).then((response) => {
      if (!response.ok) throw new Error("Could not update vote")
      if (onVote) onVote();
      return response.json();
    }).then((data) => {
      setVote(data.vote);
      setScore(data.newScore)
    }).catch(handleRestError);
  }

  const deleteVote = () => {
    if (!postId || !user) {
      console.log("Cannot post vote: user or post ID not set");
      return;
    }
    if (!vote) return;

    fetch(`http://localhost:3000/vote/${vote._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (!response.ok) throw new Error("Could not delete vote");
      setScore(score - vote.type)
      setVote(null);
      if (onVote) onVote();
      return response.json();
    }).then((data) => {
      setVote(data.vote);
      setScore(data.newScore)
    }).catch(handleRestError);
  }

  const castVote = (type: VoteType) => {
    if (!postId || !user) {
      console.log("Cannot post vote: user or post ID not set");
      return;
    }

    if (type !== VoteType.NoVote) {
      if (!!vote) putVote(type);
      else postVote(type);
    } else deleteVote();
  }

  // update formatted score text
  useEffect(() => {
    let absScore = Math.abs(score);
    let sign = score < 0 ? "-" : "";

    let mag = 1;
    for (let pref of magnitudes) {
      if (absScore >= mag * 1000) {
        mag *= 1000;
        continue;
      }

      let num = absScore / mag;
      let sigDigits = absScore !== 0 ? Math.ceil(Math.log10(num)) : 1;

      setScoreText(sign + num.toLocaleString(["en-US", "si-SL"], {maximumFractionDigits: 3 - sigDigits}) + " " + pref);
      break;
    }
  }, [score])

  useEffect(() => {
    fetchVoteState();
    fetchPostScore();
  }, [user, postId])

  // update vote state

  const handleUpvotePress = () => {
    castVote(!vote || vote.type !== VoteType.UpVote ? VoteType.UpVote : VoteType.NoVote);
  }
  const handleDownvotePress = () => {
    castVote(!vote || vote.type !== VoteType.DownVote ? VoteType.DownVote : VoteType.NoVote);
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={4}
      bg="gray.50"
      p={4}
      borderRadius="md"
      boxShadow="sm"
      _hover={{ bg: 'gray.100' }}
      transition="background-color 0.3s ease"
    >
      {/* Upvote Button */}
      <IconButton
        onClick={handleUpvotePress}
        disabled={!user}
        aria-label="Upvote"
        colorScheme={!!vote && vote.type === VoteType.UpVote ? 'blue' : undefined}
        icon={<ArrowUpIcon />}
        size="lg"
        variant={!!vote && vote.type === VoteType.UpVote ? 'solid' : 'outline'} // Solid variant when active
        _hover={{ bg: 'blue.50' }}
        _active={{ bg: 'blue.100' }}
        isRound
        borderColor={!!vote && vote.type === VoteType.UpVote ? 'blue.500' : undefined} // Add a border to active button
        boxShadow={!!vote && vote.type === VoteType.UpVote ? '0 0 0 3px rgba(66, 153, 225, 0.6)' : undefined} // Add shadow to active button
      />
    
      {/* Score Text */}
      <Text
        display="inline-block"
        minWidth="2em"
        textAlign="center"
        fontWeight="bold"
        fontSize="lg"
        color="gray.800"
      >
        {scoreText}
      </Text>
    
      {/* Downvote Button */}
      <IconButton
        onClick={handleDownvotePress}
        disabled={!user}
        colorScheme={!!vote && vote.type === VoteType.DownVote ? 'blue' : undefined}
        aria-label="Downvote"
        icon={<ArrowDownIcon />}
        size="lg"
        variant={!!vote && vote.type === VoteType.DownVote ? 'solid' : 'outline'} // Solid variant when active
        _hover={{ bg: 'red.50' }}
        _active={{ bg: 'red.100' }}
        isRound
        borderColor={!!vote && vote.type === VoteType.DownVote ? 'red.500' : undefined} // Add a border to active button
        boxShadow={!!vote && vote.type === VoteType.DownVote ? '0 0 0 3px rgba(244, 85, 85, 0.6)' : undefined} // Add shadow to active button
      />
    </Box>
  );    
}

export default VoteWidget;
