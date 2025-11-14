"use client";

import { analyzeSandSample, type AnalysisState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Camera,
  FlaskConical,
  MapPin,
  RefreshCw,
  Rocket,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { LoadingSpinner } from "./loading-spinner";
import { Logo } from "./logo";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "./ui/separator";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
      size="lg"
    >
      <Rocket className="mr-2" />
      Analyze Sample
    </Button>
  );
}

function AnalysisLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner />
      <p className="mt-4 text-lg text-primary animate-pulse">
        Processing analysis...
      </p>
    </div>
  );
}

type Step = "initializing" | "requesting-location" | "uploading-image" | "entering-details" | "showing-results";
type Currency = "USD" | "INR" | "Other" | "";

export function Analyzer() {
  const initialState: AnalysisState = {};
  const [state, formAction] = useFormState(analyzeSandSample, initialState);
  
  const [step, setStep] = useState<Step>("initializing");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("");

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if(step === 'initializing') {
        const timer = setTimeout(() => setStep("requesting-location"), 1500);
        return () => clearTimeout(timer);
    }
  }, [step]);
  
  useEffect(() => {
    // This effect handles the outcome of the form submission
    if (state.message) {
      const title = state.errors ? "Validation Error" : "Analysis Error";
      const description = state.errors 
        ? Object.values(state.errors).flat().join(' ') 
        : state.message;

      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    } else if (state.summary && state.analysisData) {
      setStep("showing-results");
    }
  }, [state, toast]);


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep("entering-details");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setIsLocating(false);
        setStep("uploading-image");
        toast({
          title: "Location Acquired",
          description: "GPS coordinates have been successfully fetched.",
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Could not get GPS coordinates. Please enable location services.",
        });
        setIsLocating(false);
      }
    );
  };
  
  const handleReset = () => {
    const form = formRef.current;
    if (form) {
      form.reset();
      const formData = new FormData(); // Create an empty FormData
      formAction(formData); // Call action to trigger the reset logic
    }
    setImagePreview(null);
    setGpsLocation("");
    setSelectedCurrency("");
    setStep("initializing");
  }

  if (step === "initializing") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Logo />
        <p className="mt-4 text-muted-foreground animate-pulse">
          Initializing Interface...
        </p>
      </div>
    );
  }

  if (step === "requesting-location") {
    return (
        <AlertDialog open={true} onOpenChange={() => {}}>
             <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><MapPin className="text-primary icon-glow"/> Location Access</AlertDialogTitle>
                    <AlertDialogDescription>
                        To provide accurate analysis, we need to access your device's GPS location. This helps in correlating sand properties with geographical data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <Button onClick={handleGetLocation} disabled={isLocating}>
                         {isLocating ? 'Acquiring...' : 'Allow Access'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
  }

  if (step === "showing-results" && state?.summary && state?.analysisData) {
    return (
      <Card className="w-full max-w-lg animate-in fade-in duration-500">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center text-primary">
            <FlaskConical className="icon-glow" />
            Analysis Report
          </CardTitle>
          <CardDescription>
            Detailed results of the sand sample analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-center">Analysis Results</h3>
            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Grain Size</TableCell>
                    <TableCell className="text-right">
                      {state.analysisData.grainSize}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Density</TableCell>
                    <TableCell className="text-right">
                      {state.analysisData.density}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Coarseness</TableCell>
                    <TableCell className="text-right">
                      {state.analysisData.coarseness}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-center">AI Generated Summary</h3>
            <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-foreground/80 italic text-center">
                  "{state.summary}"
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Analysis
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Logo />
        <p className="mt-2 text-muted-foreground">
            {step === 'uploading-image' ? 'Upload a sand sample to begin analysis' : 'Provide details for the analysis'}
        </p>
      </div>
      <form ref={formRef} action={formAction} className="space-y-6">
        <Input id="gpsLocation" name="gpsLocation" type="hidden" value={gpsLocation} />
        
        <div className={cn("grid w-full items-center gap-1.5", step !== "uploading-image" && "hidden")}>
          <Label htmlFor="picture">1. Sample Image</Label>
          <Input
            id="picture"
            name="picture"
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 text-primary icon-glow" />
                    Use Camera
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 text-primary icon-glow" />
                    Upload File
                </Button>
            </div>
        </div>

        <div className={cn("space-y-8", step !== "entering-details" && "hidden")}>
            {imagePreview && (
                <div className="relative group mt-2">
                    <Image
                    src={imagePreview}
                    alt="Sample preview"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full aspect-[4/3]"
                    />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 opacity-80 group-hover:opacity-100" onClick={() => {setImagePreview(null); setStep("uploading-image")}}>Change</Button>
                </div>
            )}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="font-semibold">Coin Currency*</Label>
                    <RadioGroup name="coinCurrency" required className="flex gap-4" onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring flex-1 justify-center cursor-pointer">
                            <RadioGroupItem value="USD" /> US Coins (USD)
                        </Label>
                         <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring flex-1 justify-center cursor-pointer">
                            <RadioGroupItem value="INR" /> Indian Rupee (INR)
                        </Label>
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring flex-1 justify-center cursor-pointer">
                            <RadioGroupItem value="Other" /> Other
                        </Label>
                    </RadioGroup>
                </div>

                {selectedCurrency === "USD" && (
                    <div className="space-y-2 animate-in fade-in">
                        <Label className="font-semibold">What coin did you include in the picture?*</Label>
                        <p className="text-sm text-muted-foreground">Please use a US coin. Images with other coins will be batch processed at a later date.</p>
                        <p className="text-sm text-muted-foreground"><b>US Coins:</b> Penny (1¢), Nickel (5¢), Dime (10¢), Quarter (25¢)</p>
                        <RadioGroup name="coinInPicture" required={selectedCurrency === 'USD'} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                           <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="Penny (1¢)" /> Penny (1¢)
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="Nickel (5¢)" /> Nickel (5¢)
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="Dime (10¢)" /> Dime (10¢)
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="Quarter (25¢)" /> Quarter (25¢)
                            </Label>
                        </RadioGroup>
                    </div>
                )}
                 {selectedCurrency === "INR" && (
                    <div className="space-y-2 animate-in fade-in">
                        <Label className="font-semibold">What coin did you include in the picture?*</Label>
                         <p className="text-sm text-muted-foreground">Please use an Indian Rupee coin. Images with other coins will be batch processed at a later date.</p>
                        <p className="text-sm text-muted-foreground"><b>Indian Coins:</b> ₹1, ₹2, ₹5, ₹10</p>
                        <RadioGroup name="coinInPicture" required={selectedCurrency === 'INR'} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                           <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="₹1" /> ₹1
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="₹2" /> ₹2
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="₹5" /> ₹5
                            </Label>
                            <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                                <RadioGroupItem value="₹10" /> ₹10
                            </Label>
                        </RadioGroup>
                    </div>
                )}
                {selectedCurrency === "Other" && (
                     <div className="grid w-full items-center gap-1.5 animate-in fade-in">
                        <Label htmlFor="coinInPicture" className="font-semibold">What coin did you include in the picture?*</Label>
                        <Input id="coinInPicture" name="coinInPicture" placeholder="e.g., 1 Euro" required={selectedCurrency === "Other"} />
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="font-semibold">Location on Beach*</Label>
                    <div className="text-sm text-muted-foreground">
                        <p>Where on the beach did you collect this sample?</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>The <b>berm</b> is the dry part of the beach where you would set up your beach chair.</li>
                            <li>The <b>swash</b> is the wet part of the beach sloping into the water.</li>
                            <li>The <b>dune</b> is the sand hill on the beach. Careful not to damage any vegetation on the dune.</li>
                        </ul>
                    </div>
                     <RadioGroup name="locationOnBeach" required className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                            <RadioGroupItem value="Dune" /> Dune
                        </Label>
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                            <RadioGroupItem value="Berm" /> Berm
                        </Label>
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                            <RadioGroupItem value="Swash" /> Swash
                        </Label>
                        <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-ring justify-center cursor-pointer">
                             <RadioGroupItem value="Other" /> Other
                        </Label>
                    </RadioGroup>
                </div>
            </div>
            <SubmitButton />
        </div>

        <FormStatusHandler />
      </form>
    </div>
  );
}

function FormStatusHandler() {
    const { pending } = useFormStatus();
    return pending ? <AnalysisLoadingScreen /> : null;
}
