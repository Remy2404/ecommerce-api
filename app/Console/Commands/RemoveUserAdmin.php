<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class RemoveUserAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:remove-admin {email : The email of the user to remove admin privileges}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove administrator privileges from a user';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->argument('email');

        $validator = Validator::make(['email' => $email], [
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        if ($validator->fails()) {
            $this->error('Invalid email provided or user does not exist.');
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return Command::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return Command::FAILURE;
        }

        if (!$user->is_admin) {
            $this->info("User '{$user->name}' ({$email}) is already a regular user.");
            return Command::SUCCESS;
        }

        $user->is_admin = false;
        $user->save();

        $this->info("User '{$user->name}' ({$email}) has been changed to a regular user.");
        return Command::SUCCESS;
    }
}
