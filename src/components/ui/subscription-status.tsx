"use client";

import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function SubscriptionStatus() {
  const { user, subscriptionStatus } = useUser();

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800';
      case 'PRO': return 'bg-blue-100 text-blue-800';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    if (!subscriptionStatus) return 'text-green-600';
    if (subscriptionStatus.isExpired) return 'text-red-600';
    if (subscriptionStatus.needsRenewal) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!subscriptionStatus) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (subscriptionStatus.isExpired) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (subscriptionStatus.needsRenewal) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = () => {
    if (!subscriptionStatus) return 'Active';
    if (subscriptionStatus.isExpired) return 'Expired';
    if (subscriptionStatus.needsRenewal) return 'Renewal Required';
    return 'Active';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Subscription Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Current Plan</span>
          <Badge className={getPlanColor(user.plan)}>
            {user.plan}
          </Badge>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Credits</span>
          <span className="text-sm font-bold">
            {user.plan === 'PREMIUM' ? 'Unlimited' : `${user.credits} remaining`}
          </span>
        </div>

        {/* Subscription Details for Paid Plans */}
        {user.plan !== 'FREE' && (
          <>
            {user.subscriptionExpiry && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Expires</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {formatDate(user.subscriptionExpiry)}
                  </span>
                </div>
              </div>
            )}

            {subscriptionStatus && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Days Remaining</span>
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                  {subscriptionStatus.isExpired ? '0' : subscriptionStatus.daysUntilExpiry}
                </span>
              </div>
            )}

            {user.lastCreditReset && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Last Reset</span>
                <span className="text-sm text-gray-500">
                  {formatDate(user.lastCreditReset)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t space-y-2">
          {user.plan === 'FREE' ? (
            <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          ) : (
            <>
              {subscriptionStatus?.needsRenewal && (
                <Button 
                  className="w-full"
                  variant={subscriptionStatus.isExpired ? "destructive" : "default"}
                  onClick={() => window.location.href = '/pricing'}
                >
                  {subscriptionStatus.isExpired ? 'Renew Expired Plan' : 'Renew Subscription'}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/pricing'}
              >
                Change Plan
              </Button>
            </>
          )}
        </div>

        {/* Renewal Notice */}
        {subscriptionStatus?.showRenewalReminder && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {subscriptionStatus.isExpired 
                  ? 'Your subscription has expired'
                  : `Subscription expires in ${subscriptionStatus.daysUntilExpiry} days`
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 