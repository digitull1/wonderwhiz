import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Block } from '../../types';
import { BlockList } from './BlockList';
import { generateBlocks } from '../../lib/api/blocks/blockGenerator';
import { useStore } from '../../store/useStore';
import { useDifficulty } from '../../hooks/useDifficulty';
import { TopicCategory } from '../../lib/topics/topicDetector';

interface DynamicBlocksProps {
  topic: TopicCategory;
  onBlockClick: (block: Block) => void;
}

export function DynamicBlocks({ topic, onBlockClick }: DynamicBlocksProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { user } = useStore();
  const { getDifficulty } = useDifficulty();

  useEffect(() => {
    let mounted = true;

    async function loadBlocks() {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const difficulty = getDifficulty(topic);
        const newBlocks = await generateBlocks({
          topic,
          age: user.age,
          difficulty,
          count: 3
        });

        if (mounted) {
          setBlocks(newBlocks);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading blocks:', error);
        if (mounted) {
          setError('Having trouble generating suggestions. Please try again! ✨');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadBlocks();

    return () => {
      mounted = false;
    };
  }, [topic, user, retryCount]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles className="w-8 h-8 text-blue-500" />
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <p className="text-red-500 mb-3">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setRetryCount(prev => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again ✨
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${topic}-${retryCount}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <BlockList blocks={blocks} onBlockClick={onBlockClick} />
      </motion.div>
    </AnimatePresence>
  );
}