import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Track conversion (optional: Google Analytics, Meta Pixel, etc.)
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: sessionId,
      });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to CAIO·AI! 🎉
            </h1>
            
            <p className="text-xl text-slate-300 mb-8">
              Your subscription is now active. Let's start making strategic decisions with confidence.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Next Steps:</h2>
              <ul className="text-left space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Access your Dashboard and explore Quick Actions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Start your first strategic analysis with CAIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Create Workspaces for your strategic initiatives</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Invite your team members (Teams plan)</span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-slate-500 mt-6">
              Session ID: {sessionId}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}