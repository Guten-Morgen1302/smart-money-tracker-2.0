import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CryptoNewsPost = {
  title: string;
  url: string;
  upvotes: number;
  created: number;
  author: string;
  subreddit: string;
};

export default function CryptoTopNews() {
  const { data: cryptoNews, isLoading, error } = useQuery({
    queryKey: ['/api/crypto-top-today'],
    staleTime: 300000, // Refresh every 5 minutes
    retry: 2
  });

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    } else {
      return `${Math.floor(diff / 86400)}d ago`;
    }
  };

  const formatUpvotes = (upvotes: number) => {
    if (upvotes >= 1000) {
      return `${(upvotes / 1000).toFixed(1)}k`;
    }
    return upvotes.toString();
  };

  if (isLoading) {
    return (
      <Card className="bg-[#191A2A] border-white/10">
        <CardHeader className="p-4 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <i className="ri-newspaper-line text-orange-400"></i>
            <h3 className="font-orbitron text-lg">Top Crypto News Today</h3>
            <Badge className="bg-orange-400/20 text-orange-400 border-orange-400/50">
              r/cryptocurrency
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-t-orange-400 border-r-orange-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading top crypto news...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#191A2A] border-white/10">
        <CardHeader className="p-4 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <i className="ri-newspaper-line text-orange-400"></i>
            <h3 className="font-orbitron text-lg">Top Crypto News Today</h3>
            <Badge className="bg-red-400/20 text-red-400 border-red-400/50">
              Error
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <i className="ri-error-warning-line text-4xl text-red-400 mb-3"></i>
            <p className="text-red-400 mb-2">Failed to load crypto news</p>
            <p className="text-sm text-gray-400">Unable to fetch from Reddit API</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const post = cryptoNews as CryptoNewsPost;

  return (
    <Card className="bg-[#191A2A] border-white/10 hover:border-orange-400/30 transition-all duration-300">
      <CardHeader className="p-4 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <i className="ri-newspaper-line text-orange-400"></i>
          <h3 className="font-orbitron text-lg">Top Crypto News Today</h3>
          <Badge className="bg-orange-400/20 text-orange-400 border-orange-400/50">
            r/cryptocurrency
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Post Title */}
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <h4 className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors duration-200 leading-relaxed">
              {post.title}
            </h4>
          </a>
          
          {/* Post Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <i className="ri-arrow-up-line text-green-400"></i>
                <span className="font-medium text-green-400">{formatUpvotes(post.upvotes)}</span>
                <span>upvotes</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <i className="ri-time-line"></i>
                <span>{formatTimeAgo(post.created)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <i className="ri-user-line"></i>
                <span>u/{post.author}</span>
              </div>
            </div>
            
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>View on Reddit</span>
              <i className="ri-external-link-line"></i>
            </a>
          </div>
          
          {/* Visual Separator */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>
            <i className="ri-reddit-line text-orange-400/60"></i>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}