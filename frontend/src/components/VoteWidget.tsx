import React, {useState, useEffect, useContext, useRef} from 'react';
import {Button, Box, Text} from '@chakra-ui/react'
import {ArrowUpIcon, ArrowDownIcon} from "@chakra-ui/icons";

interface VoteWidgetProps {
  postId: string;
  userId?: string;
  score: number;
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

const magnitudes = ['', 'k', 'M', 'G', 'T']

const VoteWidget: React.FC<VoteWidgetProps> = ({
                                                 postId,
                                                 userId,
                                                 score,
                                                 onVote,
                                               }) => {
  const [scoreText, setScoreText] = useState('0');
  const [vote, setVote] = useState<Vote | null>(null);

  // REST
  const handleRestError = (err: Error) => {
    console.warn(err);
  }

  const fetchVoteState = () => {
    if (!postId || !userId) {
      console.log("Cannot fetch vote state: user or post ID not set");
      return;
    }

    fetch(`http://localhost:3000/vote?postId=${postId}&userId=${userId}`).then(
      (response) => {
        if (!response.ok) throw new Error("Could not fetch vote state");

        return response.json();
      }
    ).then((data) => {
      console.log("Vote fetched:")
      console.log(data)
      if (!data || data.length !== 1) setVote(null);
      else setVote(data[0]);
    }).catch(handleRestError)
  }

  const postVote = (type: VoteType) => {
    if (!postId || !userId) {
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
        userId: userId,
        type: type
      })
    }).then((response) => {
      if (!response.ok) throw new Error("Could not post vote");
      if(onVote) onVote();
      return response.json();
    }).then(setVote).catch(handleRestError)
  }

  const putVote = (type: VoteType) => {
    if (!postId || !userId) {
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
      if(onVote) onVote();
      return response.json();
    }).then(setVote).catch(handleRestError);
  }

  const deleteVote = () => {
    if (!postId || !userId) {
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
      setVote(null);
      if(onVote) onVote();
    }).catch(handleRestError);
  }

  const castVote = (type: VoteType) => {
    if (!postId || !userId) {
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

      setScoreText(sign + (absScore / mag).toLocaleString(["en-US", "si-SL"], {maximumFractionDigits: 2}) + " " + pref);
      break;
    }
  }, [score])

  useEffect(() => {
    fetchVoteState();
  }, [userId, postId])

  // update vote state

  const handleUpvotePress = () => {
    castVote(!vote || vote.type !== VoteType.UpVote ? VoteType.UpVote : VoteType.NoVote);
  }
  const handleDownvotePress = () => {
    castVote(!vote || vote.type !== VoteType.DownVote ? VoteType.DownVote : VoteType.NoVote);
  }

  return (
    <Box>
      <Button onClick={handleUpvotePress}
              disabled={!userId}
              aria-label="Upvote"
              colorScheme={!!vote && vote.type === VoteType.UpVote ? 'blue' : undefined}
      >
        <ArrowUpIcon/>
      </Button>
      <Text display={"inline-block"}>
        {scoreText}
      </Text>
      <Button onClick={handleDownvotePress}
              disabled={!userId}
              colorScheme={!!vote && vote.type === VoteType.DownVote ? 'blue' : undefined}
              aria-label="Downvote"
      >
        <ArrowDownIcon/>
      </Button>
    </Box>
  )
}

export default VoteWidget;
