<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class MakeUserAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {email : The email of the user to make admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Make an existing user an administrator';

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
            // This case should ideally be caught by the validator 'exists:users,email'
            $this->error("User with email '{$email}' not found.");
            return Command::FAILURE;
        }

        if ($user->is_admin) {
            $this->info("User '{$user->name}' ({$email}) is already an administrator.");
            return Command::SUCCESS;
        }

        // Assuming your User model has an 'is_admin' boolean attribute
        // and it's fillable or you're using forceFill.
        // Ensure 'is_admin' is in $fillable array in User model or use forceFill.
        // Or set it directly and save:
        $user->is_admin = true;
        $user->save();

        $this->info("User '{$user->name}' ({$email}) has been successfully made an administrator.");
        return Command::SUCCESS;
    }
}