import React, { useState } from 'react';
import { useLocation } from 'wouter'; 
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/api';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('register');
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await apiRequest("POST", "/api/auth/login", loginData);

      toast({
        title: "Login Successful",
        description: "Welcome back, Harsh Patil",
        variant: "default"
      });

      localStorage.setItem('username', loginData.username);
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await apiRequest("POST", "/api/auth/register", {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
        variant: "default"
      });

      setAuthType('login');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Username may already be taken or there was a server error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter text-white bg-background min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="circuit-pattern"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0E19]/90 pointer-events-none"></div>
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Animated Light Beams */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/50 via-transparent to-purple-500/50 animate-pulse"></div>
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-purple-500/50 via-transparent to-cyan-400/50 animate-pulse" style={{animationDelay: '1s'}}></div>

      {/* Enhanced Logo Section */}
      <div className="mb-12 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Animated Logo Container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 blur-lg opacity-60 animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center glow-border animate-glow transform hover:scale-105 transition-transform duration-300">
              <span className="font-orbitron font-bold text-white text-4xl">SM</span>
            </div>
            
            {/* Orbiting Elements */}
            <div className="absolute inset-0 w-20 h-20">
              <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-spin" style={{
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                transformOrigin: '0 44px'
              }}></div>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full animate-spin" style={{
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                transformOrigin: '0 -44px',
                animationDirection: 'reverse',
                animationDelay: '1s'
              }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl cybr-text-gradient mb-3 animate-fade-in">
              SmartMoney AI
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              🚀 Advanced whale transaction tracking for crypto traders
            </p>
            <p className="text-cyan-400/70 text-sm mt-2">
              ⚡ Real-time analytics • 🧠 AI-powered insights • 🔒 Secure access
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Auth Card */}
      <div className="relative z-10">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-2xl blur-xl transform scale-105"></div>
        
        <Card className="relative w-full max-w-md bg-[#191A2A]/90 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-2xl">
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 p-[1px] animate-spin-slow">
            <div className="w-full h-full bg-[#191A2A] rounded-2xl"></div>
          </div>
        <div className="relative z-10">
          <Tabs defaultValue={authType} onValueChange={(value) => setAuthType(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 bg-[#0A0A10]/70 backdrop-blur border border-cyan-400/20 rounded-xl">
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-lg transition-all duration-300">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:shadow-lg transition-all duration-300">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader className="text-center">
                <CardTitle className="font-orbitron text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  🔐 Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      className="bg-[#0A0A10]/70 border-cyan-400/30 focus:border-cyan-400/80 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300 pl-10"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    <i className="ri-user-line absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70"></i>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="bg-[#0A0A10]/70 border-cyan-400/30 focus:border-cyan-400/80 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300 pl-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70"></i>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:from-cyan-500 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-cyan-400/25 font-semibold"
                  disabled={loading}
                >
                  {loading ?
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Logging in...
                    </div> :
                    "Sign In"
                  }
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardHeader className="text-center">
                <CardTitle className="font-orbitron text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  🚀 Register to start tracking whale transactions
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    type="text"
                    placeholder="Choose a username"
                    className="bg-[#0A0A10]/70 border-purple-500/30 focus:border-purple-500/80"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-[#0A0A10]/70 border-purple-500/30 focus:border-purple-500/80"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Create a password"
                    className="bg-[#0A0A10]/70 border-purple-500/30 focus:border-purple-500/80"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="bg-[#0A0A10]/70 border-purple-500/30 focus:border-purple-500/80"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-400/25 font-semibold"
                  disabled={loading}
                >
                  {loading ?
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div> :
                    "Create Account"
                  }
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          </Tabs>
        </div>
      </Card>
      </div>

      {/* Enhanced Cyberpunk Decoration Elements */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/30 to-purple-500/0 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/30 to-cyan-400/0 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Additional Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 border border-cyan-400/20 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 border border-purple-500/20 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}}></div>
      
      {/* Diagonal Lines */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent transform -rotate-12"></div>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm relative z-10">
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center"><i className="ri-shield-check-line mr-1 text-green-400"></i> Secure</span>
            <span className="flex items-center"><i className="ri-time-line mr-1 text-blue-400"></i> Real-time</span>
            <span className="flex items-center"><i className="ri-brain-line mr-1 text-purple-400"></i> AI-Powered</span>
          </div>
          <p>© 2023 Smart Money Tracker AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
