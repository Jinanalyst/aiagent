"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Settings, Users, Globe } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';

export default function WorkspaceSettingsPage() {
    const { user } = useUser();
    const [workspaceSettings, setWorkspaceSettings] = useState({
        name: 'My Workspace',
        description: 'AI-powered development workspace',
        isPublic: false,
        allowCollaboration: true,
        autoSave: true,
        theme: 'dark',
    });

    const updateSetting = (key: string, value: unknown) => {
        setWorkspaceSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = () => {
        // Save workspace settings to localStorage
        if (user) {
            localStorage.setItem(`workspace_settings_${user.walletAddress}`, JSON.stringify(workspaceSettings));
            alert('Workspace settings saved successfully!');
        }
    };

    const handleDeleteWorkspace = () => {
        if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
            // Delete workspace data
            if (user) {
                localStorage.removeItem(`workspace_settings_${user.walletAddress}`);
                localStorage.removeItem(`projects_${user.walletAddress}`);
                alert('Workspace deleted successfully!');
                window.location.href = '/dashboard';
            }
        }
    };

    return (
        <>
            <ProfileSidebar />
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-3 mb-8">
                        <Settings className="h-8 w-8 text-blue-400" />
                        <h1 className="text-3xl font-bold">Workspace Settings</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* General Settings */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-white">
                                    <Settings className="h-5 w-5" />
                                    <span>General</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="workspace-name" className="text-gray-300">Workspace Name</Label>
                                    <Input
                                        id="workspace-name"
                                        value={workspaceSettings.name}
                                        onChange={(e) => updateSetting('name', e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white mt-1"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="workspace-description" className="text-gray-300">Description</Label>
                                    <Textarea
                                        id="workspace-description"
                                        value={workspaceSettings.description}
                                        onChange={(e) => updateSetting('description', e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white mt-1"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Auto Save</Label>
                                        <p className="text-sm text-gray-400">Automatically save changes</p>
                                    </div>
                                    <Switch
                                        checked={workspaceSettings.autoSave}
                                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Collaboration Settings */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-white">
                                    <Users className="h-5 w-5" />
                                    <span>Collaboration</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Public Workspace</Label>
                                        <p className="text-sm text-gray-400">Make workspace visible to others</p>
                                    </div>
                                    <Switch
                                        checked={workspaceSettings.isPublic}
                                        onCheckedChange={(checked) => updateSetting('isPublic', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Allow Collaboration</Label>
                                        <p className="text-sm text-gray-400">Let others contribute to projects</p>
                                    </div>
                                    <Switch
                                        checked={workspaceSettings.allowCollaboration}
                                        onCheckedChange={(checked) => updateSetting('allowCollaboration', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appearance Settings */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-white">
                                    <Globe className="h-5 w-5" />
                                    <span>Appearance</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-300">Theme</Label>
                                    <select
                                        value={workspaceSettings.theme}
                                        onChange={(e) => updateSetting('theme', e.target.value)}
                                        className="w-full mt-1 bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="bg-red-900/20 border-red-700">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-red-400">
                                    <Trash2 className="h-5 w-5" />
                                    <span>Danger Zone</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-white font-medium mb-2">Delete Workspace</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Permanently delete this workspace and all associated projects. This action cannot be undone.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteWorkspace}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Workspace
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={handleSaveSettings}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}